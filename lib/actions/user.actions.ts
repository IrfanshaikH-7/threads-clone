"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface updateUserProps {
    userId: string,         //these are props
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string
}
export async function updateUser({
    userId,         //these are props  sswxZPBRc9ZB97dz
    username,
    name,
    bio,
    image,
    path,
}: updateUserProps): Promise<void> {

    connectToDB(); //connecting to db
    try {


        await User.findOneAndUpdate(    //  User is a schema and findoneandupdate is a object which takes two parameters
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,   //here the first bio is of dbschema and the second one is of props getting from (Form)
                image,
                onboarded: true
            },
            { upsert: true }

        );

        if (path === '/profile/edit') {
            revalidatePath(path)
        }

    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }

}

export async function fetchUser(userId: string) {
    try {
        connectToDB();
        return await User.findOne({ id: userId }
            //     .populate({
            //     path: 'communities',
            //     model: Community
            // })
        )
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`)
    }
}
export async function fetchUserPosts(userId: string) {

    try {
        connectToDB();

        //find threads authored by the user with the giver user id

        //TODO community
        const threads = await User.findOne({ id: userId })
            .populate({
                path: 'threads',
                model: Thread,
                populate: {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'name image id'
                    }

                }

            })
        return threads;
    } catch (error: any) {
        throw new Error(`Failed to fetch profile threads${error.message}`)
    }
}

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
}: {
    userId: string,
    searchString?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy: SortOrder
}) {
    try {
        connectToDB();
        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, 'i');

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId}
        }
        if(searchString.trim() !== ""){
            query.$or = [
                {username: {$regex: regex}},
                {name: {$regex: regex}}
            ]
        }

        const sortOptions = {createdAt: sortBy};

        const usersQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query)

        const users = await usersQuery.exec();
        
        const isNext = totalUsersCount > skipAmount + users.length;
        return ({users,isNext});

    } catch (error: any) {
        throw new Error(`Error fetching users:${error.message}`)
    }
}

export async function fetchActivity(userId: string) {
   
    try {
         connectToDB();

        // find all threads created by the user
        const userThreads = await Thread.find({author: userId});

        //Collect all the child thread ids (replies) from the children field
        const childThreadId = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        },[])

        const replies = await Thread.find({
            _id:{$in: childThreadId},
            author: {$ne: userId}
            }).populate({
                path: 'author',
                model: User,
                select: 'name image _id'
            })

            return replies;

    } catch (error: any) {
        throw new Error(`Failed to get activities: ${error.message}`)
    }
}

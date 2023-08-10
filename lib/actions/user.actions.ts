"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";

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
export async function fetchUserPosts(userId : string) {
    
    try {
        connectToDB();

        //find threads authored by the user with the giver user id

        //TODO community
        const threads = await User.findOne({id : userId})
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

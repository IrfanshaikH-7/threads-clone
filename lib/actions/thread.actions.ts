"use server"
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache";


interface createThreadProps {
  text: string,
  author: string,
  communityId: string | null
  path: string,

}
export async function createThread({ text, author, communityId, path }: createThreadProps
) {
  try {
    connectToDB();

    // const communityIdObject = await Community.findOne(
    //   { id: communityId },
    //   { _id: 1 }
    // );

    const createdThread = await Thread.create({
      text,
      author,
      community: null, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    // if (communityIdObject) {
    //   // Update Community model
    //   await Community.findByIdAndUpdate(communityIdObject, {
    //     $push: { threads: createdThread._id },
    //   });
    // }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {

  connectToDB();
  //Calculate the number of post to skip.
  const skipAmount = (pageNumber - 1) * pageSize;
  //Fetch the posts that have no parent (Top-Level Threads)
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: 'author', model: User })
    .populate({
      path: 'children',
      populate: {
        path: 'author',
        model: User,
        select: '_id name parentId image'
      }

    })
    const totalPostCount = await Thread.countDocuments({parentId: { $in: [null, undefined] }});

    const posts = await postsQuery.exec();
    const isNext = totalPostCount > skipAmount + posts.length;

    return {posts, isNext}


}

export async function fetchThreadById(id: string){

  connectToDB();
  try {
     
    const thread = await Thread.findById(id)
    .populate({
      path: 'author',
      model: User,
      select: '_id id name image',
    })// Populate the
    .populate({ // Populate the children field
      path: 'children',
      populate: [
        {
          path: 'author', // Populate the author field within children
          model: User,
          select: "_id id name parentId image", // Select only _id and username fields of the author
        },
        {
          path: 'children', // Populate the children field within children
          model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
          populate: {
            path: "author",// Populate the author field within nested children
            model: User,
            select: '_id id name parentId image' // Select only _id and username fields of the author
          },
        },
      ],
    }).exec();

    return thread
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}` );
  }

}



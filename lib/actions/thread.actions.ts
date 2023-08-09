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



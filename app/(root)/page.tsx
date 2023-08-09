
import ThreadCard from '@/components/card/ThreadCard';
import { fetchPosts } from '@/lib/actions/thread.actions';
import User from '@/lib/models/user.model';
import { currentUser } from '@clerk/nextjs';


export default async function Home() {

  const user = await currentUser();

  const results = await fetchPosts(1,30);
  console.log(results)

  return (
    <main>
      <h1>Threads</h1>
      <section className='mt-9 flex flex-col gap-10 '>
        {results.posts.length === 0 ? (
          <p className='no-result'>No threads found</p>
        ) : (
          <>
          {results.posts.map((post)=> (
            <ThreadCard
            key={post._id}
            id={post._id} // props
            currentUserId = {user?.id || ""} 
            parentId={post.parentId}
            content={post.text}
            author={post.author}
            community={post.community}
            createdAt={post.createdAt}
            comments={post.children}
            />
          ))}
          </>
        )}

      </section>
      
    </main>
  )
}

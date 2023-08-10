import { fetchActivity, fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const page = async() => {
  const user = await currentUser(); //logged in use

  if (!user) return null;
  const userInfo = await fetchUser(user.id) //here its the id of post owner to check others profile
  if (!userInfo.onboarded) {
    redirect('/onboarding')
  }

    const activity = await fetchActivity(userInfo._id);
    return (
      <section>
        <h1 className="head-text">Activity</h1>
        <section className="mt-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          <>
          {activity.map((activity)=> (
            <Link
            key={activity._id}
            href={`/thread/${activity.parentId}`}

            >
              <article className="activity-card">
              <Image 
              src={activity.author.image}
              alt="Profile picture"
              width={20}
              height={20}
              className="rounded-full object-cover"
              />
              <p className="!text-small-regular text-light-1">
                <span className="mr-1 text-primary-500">
                  {activity.author.name}
                </span>{" "}
                replied to your thread
              </p>
              </article>
            </Link>
          ))}
          </>
        ): (
          <p className="!text-base-regular text-light-3">No activity yet</p>
        )}
        </section>
      </section>
    )
  }
  
  export default page
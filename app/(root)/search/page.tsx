import UserCard from "@/components/card/UserCard";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser(); //logged in use

  if (!user) return null;
  const userInfo = await fetchUser(user.id) //here its the id of post owner to check others profile
  if (!userInfo.onboarded) {
    redirect('/onboarding')
  }

  const result = await fetchUsers({
    userId: user.id,
    searchString: "",
    pageNumber: 1,
    pageSize: 25,
    sortBy: 'desc'
  })

  return (
    <section>
      <h1 className="head-text">Search</h1>
      {/* // TODO searchBar */}

      <div className="mt-14 flex flex-col gap-9">
        {result.users.length === 0 ? (
          <p className="no-result">No users</p>
        ) : (
          <>
            {result.users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                imgUrl={person.image}
                personType="User"
              />
            ))}
          </>
        )}

      </div>
    </section>
  )
}

export default Page;

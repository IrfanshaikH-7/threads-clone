// import { currentUser } from "@clerk/nextjs";

// import UserCard from "../cards/UserCard";

// import { fetchCommunities } from "@/lib/actions/community.actions";
// import { fetchUsers } from "@/lib/actions/user.actions";

async function RightSidebar() {
  // const user = await currentUser();
  // if (!user) return null;

  // const similarMinds = await fetchUsers({
  //   userId: user.id,
  //   pageSize: 4,
  // });

  // const suggestedCOmmunities = await fetchCommunities({ pageSize: 4 })

  return (
    <section className='custom-scrollbar rightsidebar'>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>
          Suggested Communities
        </h3>

      </div>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>
          Suggested Communities
        </h3>

      </div>
    </section>
  );
}

export default RightSidebar;
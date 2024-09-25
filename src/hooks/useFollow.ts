import { addFollow } from "@/api/follow"
import { QueryCache, QueryClient, useMutation } from "@tanstack/react-query"
import { useEffect } from "react"


interface FollowProps{
    user_email:string
}



const useFollow = (string:FollowProps)=>{

const queryClient=new QueryClient();


useEffect(()=>{
  const followMutation=useMutation(,{
    onMutate:async (user_email) =>{
    console.log("onMutate 호출")
    await queryClient.cancelQueries({queryKey:["followUser"]}
      
    )
    const previousFollowUser=queryClient.getQueryData(["followUser"])
    queryClient.setQueryData(["followUser"],(user:string)=>[...user,user_email])
    return {previousFollowUser}
  },
     onError:(context)=>{
      console.log("follow mutate 중 에러 발생 :",context)
      queryClient.setQueryData(["followUser"],context.previousFollowUser)
     },
     onSettled:()=>{
      console.log("onSettled")
      queryClient.invalidateQueries({queryKey:["followUser"
      ]})
     }
  },)

},[])


}



"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Role } from "@/types"
import type { Application, Job, Session } from "@/types"
import { fetchApplicationsFromBackend, fetchJobsFromBackend, getApiHealth, loginToBackend, saveApiToken, type ApiHealthResponse } from "@/lib/api-client"

type Store = { ready:boolean; session:Session|null; jobs:Job[]; applications:Application[]; saved:string[]; apiStatus:ApiHealthResponse|null; token:string|null; login:(role:Role,email:string,password:string)=>Promise<string|null>; logout:()=>void; switchRole:(role:Role)=>void; toggleSaved:(id:string)=>void; apply:(job:Job,note:string)=>void; withdraw:(id:string)=>void; updateApplication:(id:string,status:Application["status"])=>void; saveJob:(job:Job)=>void; deleteJob:(id:string)=>void }
const Context=createContext<Store|null>(null)
const KEY="jejak-lulusan-state-v2"

const seededJobs:Job[]=[]
const seededApplications:Application[]=[]

const demoAccounts:Record<Role,{name:string,email:string,password:string}>={
  alumni:{name:"Alumni SMK Nusantara",email:"alumni@smknusantara.sch.id",password:"alumni123"},
  perusahaan:{name:"Perusahaan Mitra",email:"perusahaan@smknusantara.sch.id",password:"perusahaan123"},
  admin:{name:"Admin SMK Nusantara",email:"admin@smknusantara.sch.id",password:"admin123"},
}

export function AppProvider({children}:{children:React.ReactNode}){
 const router=useRouter()
 const [ready,setReady]=useState(false)
 const [session,setSession]=useState<Session|null>(null)
 const [jobs,setJobs]=useState<Job[]>([])
 const [applications,setApplications]=useState<Application[]>([])
 const [saved,setSaved]=useState<string[]>([])
 const [token,setToken]=useState<string|null>(null)
 const [apiStatus,setApiStatus]=useState<ApiHealthResponse|null>(null)

 useEffect(()=>{
  try{
   const raw=localStorage.getItem(KEY)
   if(raw){
    const x=JSON.parse(raw)
    setSession(x.session??null)
    setJobs(x.jobs??seededJobs)
    setApplications(x.applications??seededApplications)
    setSaved(x.saved??[])
    setToken(x.token??null)
   }
  } catch {
   // Ignore invalid stored state and keep seeded data.
  } finally {
   void (async ()=>{
    try {
      const health=await getApiHealth()
      setApiStatus(health)
    } catch {
      setApiStatus({success:false,message:"Backend belum tersedia"})
    } finally {
      setReady(true)
    }
   })()
  }
 },[])

 useEffect(()=>{if(ready)localStorage.setItem(KEY,JSON.stringify({session,jobs,applications,saved,token}))},[ready,session,jobs,applications,saved,token])

 useEffect(()=>{
  if(!ready || !token) return
  void (async ()=>{
   try {
    const backendJobs=await fetchJobsFromBackend()
    if(backendJobs.length) setJobs(backendJobs)
   } catch {}
   try {
    const backendApplications=await fetchApplicationsFromBackend()
    if(backendApplications.length) setApplications(backendApplications)
   } catch {}
  })()
 },[ready,token])

 const login=async (role:Role,email:string,password:string):Promise<string|null>=>{
  const account=demoAccounts[role]
  const nextSession={role,email,name:account.name}
  setSession(nextSession)
  router.push("/dashboard")
  const result=await loginToBackend(email,password)
  if(result.ok && result.token){
   setToken(result.token)
   saveApiToken(result.token)
   setApiStatus({success:true,message:"Backend terhubung"})
   return null
  }
  const fallbackMessage=email===account.email&&password===account.password?"Backend tidak merespons; memakai mode demo":"Login backend gagal. Coba gunakan akun yang valid."
  setApiStatus({success:false,message:result.message||fallbackMessage})
  return result.message||fallbackMessage
 }
 const logout=()=>{setSession(null);setToken(null);saveApiToken(null);router.push("/login")}
 const switchRole=(role:Role)=>{const a=demoAccounts[role];setSession({role,email:a.email,name:a.name});router.push("/dashboard")}
 const toggleSaved=(id:string)=>setSaved(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
 const apply=(job:Job,note:string)=>setApplications(a=>[{id:`APP-${String(a.length+1).padStart(3,"0")}`,jobId:job.id,jobTitle:job.title,company:job.company,date:"14 Juli 2026",status:"Dikirim",note:note||"Lamaran berhasil dikirim dan menunggu peninjauan perusahaan."},...a])
 const withdraw=(id:string)=>setApplications(a=>a.filter(x=>x.id!==id))
 const updateApplication=(id:string,status:Application["status"])=>setApplications(a=>a.map(x=>x.id===id?{...x,status}:x))
 const saveJob=(job:Job)=>setJobs(x=>{const exists=x.some(j=>j.id===job.id);return exists?x.map(j=>j.id===job.id?job:j):[job,...x]})
 const deleteJob=(id:string)=>setJobs(x=>x.filter(j=>j.id!==id))
 return <Context.Provider value={{ready,session,jobs,applications,saved,apiStatus,login,logout,switchRole,toggleSaved,apply,withdraw,updateApplication,saveJob,deleteJob}}>{children}</Context.Provider>
}
export function useApp(){const v=useContext(Context);if(!v)throw new Error("useApp must be used inside AppProvider");return v}

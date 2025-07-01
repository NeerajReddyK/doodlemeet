"use client"

import axios from "axios";
import { useRouter } from "next/navigation";

const SignUp = () => {

  const beUrl = process.env.NEXT_PUBLIC_BE_URL;
  const router = useRouter();

  const signUpOnClick = async () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const name = document.getElementById("name") as HTMLInputElement;

    const response = await axios.post(`${beUrl}/signup`, {
      name: name.value,
      email: email.value,
      password: password.value
    });

    localStorage.setItem("token", response.data.token);
    console.log("SignUp successful");

    router.push("/canvas");

  }

  return (
    <div className="flex items-center justify-center h-screen w-screen pb-16 border-4 rounded-lg">
      <div className="border rounded-lg p-4">
        <h1 className="text-3xl items-center flex justify-center pb-6">SignUp</h1>

        <div className="pb-4">
          <label htmlFor="name">name: </label>
          <input type="text" id="name" placeholder="john" className="px-2 py-1"/>
        </div>

        <div className="pb-4">
          <label htmlFor="email">email: </label>
          <input type="text" id="email" placeholder="john@doe.com" className="px-2 py-1"/>
        </div>

        <div>
          <label htmlFor="password">password: </label>
          <input type="password" id="password" placeholder="********"  className="px-2 py-1"/>
        </div>

        <button className="bg-blue-400 rounded-lg p-2 mt-4 w-full cursor-pointer" onClick={signUpOnClick}>Signup</button>
 
      </div>
   </div>
  )
}

export default SignUp;
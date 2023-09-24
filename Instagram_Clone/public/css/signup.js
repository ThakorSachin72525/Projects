const formSubmit = document.getElementById("submit");
formSubmit.addEventListener("click",async (event)=>{
    event.preventDefault()
    const userName=document.getElementById("username").value
    const userEmail=document.getElementById("email").value
    const userPassword=document.getElementById("password").value
    const nameOfUser = document.getElementById("name").value
    const userBio = document.getElementById("bio").value

    if(!userName && userEmail &&userEmail && userPassword  && nameOfUser && userBio) {  
        alert("All input fields are required")
        return 
    }
   
    const userData = {
        name:nameOfUser,
        email:userEmail,
        bio:userBio,
        password:userPassword,
        username:userName
    }

    // Log the input data to the console
    console.log(userData);
    // Send the data to the server for registration
    await registerUser(userData);
})

const registerUser =async(payload)=>{  
    try {
    const resp = await fetch("/signup",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify(payload)
    })

    const data = await resp.json();
    console.log(data)
    window.location.href="/login"
    
   } catch (error) {
        console.log(error.message)
   }
}

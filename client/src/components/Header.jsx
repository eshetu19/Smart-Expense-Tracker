import { useState } from "react"

function Header() {

    function handleClick(){
        console.log("parent notified")
    }
    // let renda = true
    // function toggleRenda(){
    //     renda = !renda
    //     console.log(renda)
    // }
    // const [count ,setCount]=useState(0)
   return(
    <>
        
     <Child></Child>
     {/* <button onClick={()=>
        setCount((prev)=>prev+1)
        } >count:{count}</button>
   
        <h1>Hello World</h1>  */}
    
    </>
   )    
}
export default Header
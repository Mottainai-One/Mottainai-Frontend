import { Link } from "react-router-dom"
import {useEffect, useState} from "react"
import Loading from "@/components/Loading"

function App() {
    const [isLoading, setIsLoading] = useState(true)
    useEffect(()=>{

        setTimeout(() => {
            setIsLoading(false)
        }, 4000);

    }, [])

    if(isLoading){
            return <Loading/>
        }
    
        return(
            <>
            Hello!
            <Link to='/home'>Home</Link>
            </>
        )
    }

export default App



import { LoginRequestProps } from "@/interface/UserProps";
import { FetchData } from "../fetch_manager/FetchManager";



// LogInApi.ts
export const LogInApi = async (props: LoginRequestProps) => {
    const Port = "http://127.0.0.1:8000";     //defining the backend port
    const url = `${Port}/users/login`;            // defining the route for log in


    // passing in the fields required in the server side
    const { email, password } = props

    // making an options header for correct data posting
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    };

    // fetching the data from the server
    const response = await FetchData(url, options);

    if (!response.ok) {
        // Throw the entire response object
        const errorData = await response.json();
        console.log(errorData);
        throw { status: response.status, ...errorData };
    }

    return response.json();
}
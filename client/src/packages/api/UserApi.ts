// creating user by admins
import { FetchData } from "../fetch_manager/FetchManager";
import {
    CreateUserProps,
    CreateUserResponse,
    AllUsersProp,
    UpdateUserProp
} from "@/interface/UserProps";


// creating users login
export const CreateUserApi = async (props: CreateUserProps): Promise<CreateUserResponse> => {
    const Port = "http://127.0.0.1:8000";     //defining the backend port
    const url = `${Port}/users/create`;            // defining the route for log in


    // passing in the fields required in the server side
    const { full_name, email, role, is_active, restaurant_id, password } = props

    // making an options header for correct data posting
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ full_name, email, role, is_active, restaurant_id, password }),
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



// api to list all users
export const AllUsersApi = async (): Promise<AllUsersProp> => {
    const Port = "http://127.0.0.1:8000";
    const url = `${Port}/users/all_users`;

    // making an options header for correct data posting
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
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


// api to update users info
export const UpdateUserApi = async (prop: UpdateUserProp) => {
    const { userId, user } = prop


    const Port = "http://127.0.0.1:8000";
    const url = `${Port}/users/edit/${userId}`;

    const options = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include" as RequestCredentials,
        body: JSON.stringify(user),
    };

    const response = await FetchData(url, options);

    if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, ...errorData };
    }

    return response.json();
};

export const DeleteUserApi = async (userId: string) => {
    
    const Port = "http://127.0.0.1:8000";
    const url = `${Port}/users/delete/${userId}`;

    const options = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include" as RequestCredentials,
    };

    const response = await FetchData(url, options);

    if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, ...errorData };
    }

    return response.json(); 
};


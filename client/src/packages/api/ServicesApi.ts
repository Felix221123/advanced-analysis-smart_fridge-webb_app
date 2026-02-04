import { FetchData } from "../fetch_manager/FetchManager";
import { AllFoodItemProps, CreateFoodItemProps, EditFoodItemProps } from "@/interface/ComponentProps";




// api to get all products
export const AllProducts = async (): Promise<AllFoodItemProps[]> => {
    const Port = "http://127.0.0.1:8000";
    const url = `${Port}/service/all_food_items`;

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


export const DeleteProductApi = async (user_id: string, food_item_id: string) => {
    const Port = "http://127.0.0.1:8000";
    const url = `${Port}/service/food_items/${food_item_id}?user_id=${encodeURIComponent(user_id)}`;

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



export const UpdateFoodItemApi = async (props: EditFoodItemProps): Promise<AllFoodItemProps> => {
    const Port = "http://127.0.0.1:8000";
    const url = `${Port}/service/food_items/${props.food_item_id}`;

    const options = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include" as RequestCredentials,
        body: JSON.stringify(props),
    };

    const response = await FetchData(url, options);

    if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, ...errorData };
    }

    return response.json();
};



export const CreateFoodItemApi = async (props: CreateFoodItemProps): Promise<AllFoodItemProps> => {
    const Port = "http://127.0.0.1:8000";
    const url = `${Port}/service/food_items`;

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include" as RequestCredentials,
        body: JSON.stringify(props),
    };

    const response = await FetchData(url, options);

    if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, ...errorData };
    }

    return response.json();
};


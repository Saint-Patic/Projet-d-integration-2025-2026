import apiClient from "./apiClient";

export interface Localisation {
	gps_data: string;
	city: string;
	postcode: string;
	country: string;
}

export const getLocalisation = async (): Promise<Localisation[]> => {
	try {
		const response = await apiClient.get<Localisation[]>("/localisation");
		return response.data;
	} catch (error) {
		console.error("Error fetching localisation:", error);
		throw error;
	}
};

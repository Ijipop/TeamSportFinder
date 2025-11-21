// Adaptateur Clerk pour mapper vers l'interface User existante (Principe Open/Closed)
import { useUser } from "@clerk/clerk-react";
import { injectable } from "inversify";
import type { User as AppUser } from "../../types";
import type { IClerkAdapter } from "../interfaces";

// Type pour Clerk User (extrait du type retourné par useUser)
type ClerkUser = ReturnType<typeof useUser>["user"];

// Service d'adaptation pour mapper Clerk User vers notre interface User (Principe de responsabilité unique)
@injectable()
export class ClerkAdapter implements IClerkAdapter
{
	// Mapper Clerk User vers notre interface User (Principe de responsabilité unique)
	mapClerkUserToAppUser(clerkUser: ClerkUser | null | undefined): AppUser | null
	{
		if (!clerkUser)
		{
			return null;
		}

		// Récupérer l'email principal depuis Clerk
		const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || "";
		const firstName = clerkUser.firstName || "";
		const lastName = clerkUser.lastName || "";
		
		// Récupérer les métadonnées publiques depuis Clerk
		const publicMetadata = clerkUser.publicMetadata as Record<string, any> || {};
		const phone = publicMetadata.phone as string | undefined || clerkUser.primaryPhoneNumber?.phoneNumber;
		
		// Récupérer la date de naissance depuis les métadonnées
		const dateOfBirth = publicMetadata.dateOfBirth 
			? new Date(publicMetadata.dateOfBirth as string)
			: new Date("1990-01-01");
		
		// Récupérer l'adresse depuis les métadonnées
		const address = publicMetadata.address 
			? {
				address: (publicMetadata.address as any)?.address || "",
				city: (publicMetadata.address as any)?.city || "",
				postalCode: (publicMetadata.address as any)?.postalCode || "",
				country: (publicMetadata.address as any)?.country || "",
			}
			: undefined;
		
		// Vérifier si l'email est vérifié
		const isVerified = clerkUser.emailAddresses?.some(
			email => email.emailAddress === primaryEmail && email.verification?.status === "verified"
		) ?? false;
		
		return {
			id: clerkUser.id,
			email: primaryEmail,
			firstName,
			lastName,
			phone,
			dateOfBirth,
			isVerified,
			createdAt: new Date(clerkUser.createdAt || Date.now()),
			updatedAt: new Date(clerkUser.updatedAt || Date.now()),
			avatar: clerkUser.imageUrl || undefined,
		};
	}

	// Mapper RegisterForm vers publicMetadata Clerk (Principe de responsabilité unique)
	mapRegisterFormToPublicMetadata(formData:
	{
		firstName: string;
		lastName: string;
		phone?: string;
		dateOfBirth: Date;
		address?: {
			address: string;
			city: string;
			postalCode: string;
			country: string;
		};
	}): Record<string, any>
	{
		return {
			phone: formData.phone,
			dateOfBirth: formData.dateOfBirth.toISOString(),
			address: formData.address,
		};
	}
}


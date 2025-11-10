export const profileImages: { [key: string]: any } = {
  "chat.png": require("@/assets/images/profile_pictures/chat.png"),
  "chien.png": require("@/assets/images/profile_pictures/chien.png"),
  "default.png": require("@/assets/images/profile_pictures/default.png"),
  "Frisbee.png": require("@/assets/images/profile_pictures/Frisbee.png"),
  "lezard.png": require("@/assets/images/profile_pictures/lezard.png"),
  "nathan.png": require("@/assets/images/profile_pictures/nathan.png"),
};

export function getProfileImage(imageName: string | null | undefined) {
  return (
    profileImages[imageName || "default.png"] || profileImages["default.png"]
  );
}

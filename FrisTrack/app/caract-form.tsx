import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import EditProfile from "@/components/perso_components/EditProfile";
import {
  getProfileImage,
  profilePictures,
} from "@/components/perso_components/loadImages";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/contexts/ThemeContext";
import { registerService } from "@/services/addUserLogin";
import {
  getDominantHandFromSelection,
  getDominantHandSelection,
} from "@/utils/dominantHandUtils";

const EditProfileAny: any = EditProfile;

export default function CaractForm() {
  const { email, password, nom, prenom, pseudo } = useLocalSearchParams<{
    email: string;
    password: string;
    nom: string;
    prenom: string;
    pseudo: string;
  }>();
  const { theme } = useTheme();

  // form contient uniquement les champs nécessaires
  const [form, setForm] = useState<any>({
    pointure: 37,
    main: "Droite",
    poids: 70,
    taille: 175,
    age: 25,
    ageDate: new Date(new Date().getFullYear() - 25, 0, 1),
  });

  // inputs (EditProfile attend ces states)
  const [pointureInput, setPointureInput] = useState(form.pointure.toString());
  const [poidsInput, setPoidsInput] = useState(form.poids.toString());
  const [tailleInput, setTailleInput] = useState(form.taille.toString());
  const [ageInput, setAgeInput] = useState(form.age.toString());
  const [, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [mainSelection, setMainSelection] = useState<{
    gauche: boolean;
    droite: boolean;
  }>(getDominantHandSelection(form.main));

  // minimal image picker state (not used here because we hide photo in EditProfile)
  const [showImagePicker, setShowImagePicker] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      gestureEnabled: false,
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription?.remove();
    }, [])
  );

  function filterNumericInput(text: string, type: "int" | "float") {
    let filtered = text.replace(type === "int" ? /[^0-9]/g : /[^0-9.,]/g, "");
    if (type === "float") filtered = filtered.replace(",", ".");
    return filtered;
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      const now = new Date();
      const age = Math.floor(
        (now.getTime() - selectedDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      );

      setForm({ ...form, ageDate: selectedDate, age });
      setAgeInput(age.toString());
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      let ageNumber = form.age;
      if (form.ageDate) {
        const now = new Date();
        ageNumber = Math.floor(
          (now.getTime() - new Date(form.ageDate).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
        );
      }

      const mainValue = getDominantHandFromSelection(mainSelection);

      // Calculer la date de naissance à partir de l'âge
      const birthdate = form.ageDate
        ? new Date(form.ageDate).toISOString().split("T")[0]
        : new Date(new Date().getFullYear() - ageNumber, 0, 1)
            .toISOString()
            .split("T")[0];

      const userData = {
        email: email as string,
        password: password as string,
        firstname: prenom as string,
        lastname: nom as string,
        pseudo: pseudo as string,
        birthdate,
        user_weight: parseFloat(poidsInput) || form.poids,
        user_height: parseFloat(tailleInput) || form.taille,
        foot_size: parseFloat(pointureInput) || form.pointure,
        dominant_hand: mainValue,
      };

      const response = await registerService.register(userData);

      if (response.success) {
        Alert.alert(
          "Inscription réussie",
          "Votre compte a été créé avec succès !",
          [
            {
              text: "OK",
              onPress: () => router.replace("./"),
            },
          ]
        );
      }
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue lors de l'inscription";

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error;

        if (status === 409) {
          errorMessage = message || "Email ou pseudo déjà utilisé";
        } else if (status === 400) {
          errorMessage = message || "Données invalides";
        }
      }

      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.replace({
      pathname: "./index",
    });
  };

  // simple styles reused from original caract-form (kept small)
  const styles = localStyles;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a4a55" />
      <ThemedText style={styles.title}>Caractéristiques</ThemedText>
      <EditProfileAny
        theme={theme}
        HeaderRight={undefined}
        profilePictures={profilePictures}
        getImageSource={getProfileImage}
        form={form}
        setForm={setForm}
        showImagePicker={showImagePicker}
        setShowImagePicker={setShowImagePicker}
        pointure={pointureInput}
        setPointure={setPointureInput}
        poids={poidsInput}
        setPoids={setPoidsInput}
        taille={tailleInput}
        setTaille={setTailleInput}
        age={ageInput}
        setAge={setAgeInput}
        mainSelection={mainSelection}
        setMainSelection={setMainSelection}
        filterNumericInput={filterNumericInput}
        handleSave={handleSave}
        handleCancel={handleCancel}
        styles={styles}
        showNameAndImage={false}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        onDateChange={onDateChange}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#4a4a55",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    paddingTop: 10,
    marginBottom: 12,
    color: "#f0f0f0",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 230, 230, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  containerInner: {},
  profileImageContainer: {
    position: "relative",
    marginBottom: 24,
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePickerContainer: { alignItems: "center", marginBottom: 16 },
  imagePickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 12,
  },
  cancelPickerButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  cancelPickerText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  infoContainer: {
    marginBottom: 32,
    width: "100%",
    backgroundColor:
      Platform.OS === "android" ? "#5a5a65" : "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  infoLabel: {
    fontSize: 16,
    color: "#e8e8e8",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#00d6d6",
    fontWeight: "700",
  },
  input: {
    minWidth: 80,
    flex: 1,
    fontSize: 16,
    color: "#00d6d6",
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    marginLeft: 12,
  },
  choiceButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#444",
    marginHorizontal: 4,
  },
  choiceButtonText: { color: "#fff", fontWeight: "600" },

  buttonContainer: {
    width: "100%",
    gap: 12,
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#f0f0f0",
    fontWeight: "700",
  },
});

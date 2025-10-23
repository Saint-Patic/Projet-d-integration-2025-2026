import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
  View,
  BackHandler,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import {
  router,
  useNavigation,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import EditProfile from "@/components/perso_components/EditProfile";
import { useTheme } from "@/contexts/ThemeContext";

export default function CaractForm() {
  const { email, password } = useLocalSearchParams<{
    email: string;
    password: string;
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

  const [mainSelection, setMainSelection] = useState<{
    gauche: boolean;
    droite: boolean;
  }>(
    form.main === "Ambidextre"
      ? { gauche: true, droite: true }
      : form.main === "Gauche"
      ? { gauche: true, droite: false }
      : { gauche: false, droite: true }
  );

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

  const handleSave = () => {
    let ageNumber = form.age;
    if (form.ageDate) {
      const now = new Date();
      ageNumber = Math.floor(
        (now.getTime() - new Date(form.ageDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      );
    }
    const mainValue =
      mainSelection.gauche && mainSelection.droite
        ? "Ambidextre"
        : mainSelection.gauche
        ? "Gauche"
        : "Droite";

    const payload = {
      pointure: form.pointure,
      main: mainValue,
      poids: form.poids,
      taille: form.taille,
      age: ageNumber,
    };

    Alert.alert(
      "Caractéristiques sauvegardées",
      `Pointure: ${payload.pointure}\nMain: ${payload.main}\nPoids: ${payload.poids}\nTaille: ${payload.taille}\nÂge: ${payload.age}`,
      [
        {
          text: "OK",
          onPress: () => router.replace("./(tabs)/matches"),
        },
      ]
    );
  };

  const handleCancel = () => {
    router.replace({
      pathname: "./nom-prenom-pseudo",
    });
  };

  // simple styles reused from original caract-form (kept small)
  const styles = localStyles;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a4a55" />
      <ThemedText style={styles.title}>Caractéristiques</ThemedText>

      <EditProfile
        theme={theme}
        HeaderRight={undefined}
        profilePictures={[]}
        form={form}
        setForm={setForm}
        showImagePicker={showImagePicker}
        setShowImagePicker={setShowImagePicker}
        pointureInput={pointureInput}
        setPointureInput={setPointureInput}
        poidsInput={poidsInput}
        setPoidsInput={setPoidsInput}
        tailleInput={tailleInput}
        setTailleInput={setTailleInput}
        ageInput={ageInput}
        setAgeInput={setAgeInput}
        mainSelection={mainSelection}
        setMainSelection={setMainSelection}
        filterNumericInput={filterNumericInput}
        handleSave={handleSave}
        handleCancel={handleCancel}
        styles={styles}
        showNameAndImage={false}
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

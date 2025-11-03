import React from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";

type Picture = { name: string; src: any };

interface Props {
  theme: any;
  HeaderRight?: React.ReactNode;
  profilePictures?: Picture[];
  getImageSource?: (name: string) => any;
  form: any;
  setForm: (f: any) => void;
  showImagePicker?: boolean;
  setShowImagePicker?: (v: boolean) => void;
  pointureInput: string;
  setPointureInput: (s: string) => void;
  poidsInput: string;
  setPoidsInput: (s: string) => void;
  tailleInput: string;
  setTailleInput: (s: string) => void;
  ageInput: string;
  setAgeInput: (s: string) => void;
  mainSelection: { gauche: boolean; droite: boolean };
  setMainSelection: React.Dispatch<
    React.SetStateAction<{ gauche: boolean; droite: boolean }>
  >;
  filterNumericInput: (t: string, type: "int" | "float") => string;
  handleSave: () => void;
  handleCancel: () => void;
  styles: any;
  // new optional props
  showNameAndImage?: boolean; // default true
}

export default function EditProfile(props: Props) {
  const {
    theme,
    profilePictures = [],
    getImageSource,
    form,
    setForm,
    showImagePicker = false,
    setShowImagePicker = () => {},
    pointureInput,
    setPointureInput,
    poidsInput,
    setPoidsInput,
    tailleInput,
    setTailleInput,
    ageInput,
    setAgeInput,
    mainSelection,
    setMainSelection,
    filterNumericInput,
    handleSave,
    handleCancel,
    styles,
    showNameAndImage = true,
  } = props;

  const { width } = useWindowDimensions();
  const isWide = width > 420;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
      >
        {/* Photo + message seulement si demandé */}
        {showNameAndImage && (
          <>
            {showImagePicker ? (
              <View style={styles.imagePickerContainer}>
                <ThemedText
                  style={[styles.editPhotoText, { color: theme.primary }]}
                >
                  Choisissez une photo de profil
                </ThemedText>
                <View style={styles.imagePickerGrid}>
                  {profilePictures.map((img) => (
                    <TouchableOpacity
                      key={img.name}
                      onPress={() => {
                        setForm((f: any) => ({ ...f, imageName: img.name }));
                        setShowImagePicker(false);
                      }}
                    >
                      <Image
                        source={img.src}
                        style={[
                          styles.profileImageSmall,
                          { borderColor: theme.primary },
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => setShowImagePicker(false)}
                  style={[
                    styles.cancelPickerButton,
                    { backgroundColor: theme.surface },
                  ]}
                >
                  <ThemedText
                    style={[styles.cancelPickerText, { color: theme.text }]}
                  >
                    Annuler
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.profileImageContainer}>
                <TouchableOpacity
                  onPress={() => setShowImagePicker(true)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={
                      getImageSource
                        ? getImageSource(form.imageName)
                        : undefined
                    }
                    style={[
                      styles.profileImage,
                      { borderColor: theme.primary },
                    ]}
                  />
                </TouchableOpacity>
                <ThemedText
                  style={[styles.editPhotoText, { color: theme.primary }]}
                >
                  Cliquez sur la photo pour la changer
                </ThemedText>
              </View>
            )}
          </>
        )}

        <View
          style={[
            styles.infoContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* prénom/nom seulement si demandé */}
          {showNameAndImage && (
            <>
              <View
                style={[styles.infoRow, { borderBottomColor: theme.border }]}
              >
                <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
                  Prénom
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      borderWidth: 1,
                    },
                  ]}
                  value={form.prenom}
                  onChangeText={(text) =>
                    setForm((f: any) => ({ ...f, prenom: text }))
                  }
                  placeholder="Prénom"
                  placeholderTextColor="#aaa"
                />
              </View>

              <View
                style={[styles.infoRow, { borderBottomColor: theme.border }]}
              >
                <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
                  Nom
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      borderWidth: 1,
                    },
                  ]}
                  value={form.nom}
                  onChangeText={(text) =>
                    setForm((f: any) => ({ ...f, nom: text }))
                  }
                  placeholder="Nom"
                  placeholderTextColor="#aaa"
                />
              </View>
            </>
          )}

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Pointure
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}
              value={pointureInput}
              onChangeText={(text) => {
                const filtered = filterNumericInput(text, "int");
                setPointureInput(filtered);
                if (filtered !== "")
                  setForm((f: any) => ({
                    ...f,
                    pointure: parseInt(filtered),
                  }));
              }}
              onBlur={() => {
                let value = parseInt(pointureInput);
                if (isNaN(value)) value = form.pointure;
                if (value < 15) value = 15;
                if (value > 65) value = 65;
                setPointureInput(value.toString());
                setForm((f: any) => ({ ...f, pointure: value }));
              }}
              keyboardType="numeric"
              placeholder="Pointure"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Main dominante
            </ThemedText>
            <View
              style={{
                flexDirection: isWide ? "row" : "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.choiceButton,
                  mainSelection.gauche && { backgroundColor: theme.primary },
                  !mainSelection.gauche && {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                  },
                  isWide ? { marginHorizontal: 4 } : { marginVertical: 6 },
                ]}
                onPress={() => {
                  setMainSelection(
                    (sel: { gauche: boolean; droite: boolean }) => {
                      const newSel = { ...sel, gauche: !sel.gauche };
                      if (!newSel.gauche && !newSel.droite)
                        newSel.gauche = true;
                      return newSel;
                    }
                  );
                }}
              >
                <ThemedText
                  style={[
                    styles.choiceButtonText,
                    mainSelection.gauche
                      ? { color: "#fff" }
                      : { color: theme.text },
                  ]}
                >
                  Gauche
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.choiceButton,
                  mainSelection.droite && { backgroundColor: theme.primary },
                  !mainSelection.droite && {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                  },
                  isWide ? { marginHorizontal: 4 } : { marginVertical: 6 },
                ]}
                onPress={() => {
                  setMainSelection(
                    (sel: { gauche: boolean; droite: boolean }) => {
                      const newSel = { ...sel, droite: !sel.droite };
                      if (!newSel.gauche && !newSel.droite)
                        newSel.droite = true;
                      return newSel;
                    }
                  );
                }}
              >
                <ThemedText
                  style={[
                    styles.choiceButtonText,
                    mainSelection.droite
                      ? { color: "#fff" }
                      : { color: theme.text },
                  ]}
                >
                  Droite
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Poids
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}
              value={poidsInput}
              onChangeText={(text) => {
                const filtered = filterNumericInput(text, "float");
                setPoidsInput(filtered);
                if (filtered !== "" && filtered !== "." && filtered !== ",")
                  setForm((f: any) => ({
                    ...f,
                    poids: parseFloat(filtered),
                  }));
              }}
              onBlur={() => {
                let value = parseFloat(poidsInput);
                if (isNaN(value)) value = form.poids;
                if (value < 10) value = 10;
                if (value > 300) value = 300;
                setPoidsInput(value.toString());
                setForm((f: any) => ({ ...f, poids: value }));
              }}
              keyboardType="numeric"
              placeholder="Poids"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Taille
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}
              value={tailleInput}
              onChangeText={(text) => {
                const filtered = filterNumericInput(text, "int");
                setTailleInput(filtered);
                if (filtered !== "")
                  setForm((f: any) => ({ ...f, taille: parseInt(filtered) }));
              }}
              onBlur={() => {
                let value = parseInt(tailleInput);
                if (isNaN(value)) value = form.taille;
                if (value < 50) value = 50;
                if (value > 250) value = 250;
                setTailleInput(value.toString());
                setForm((f: any) => ({ ...f, taille: value }));
              }}
              keyboardType="numeric"
              placeholder="Taille"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* âge: champ numérique simplifié */}
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.text }]}>
              Âge
            </ThemedText>

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}
              value={ageInput}
              onChangeText={(text) => {
                const filtered = filterNumericInput(text, "int");
                setAgeInput(filtered);
                if (filtered !== "")
                  setForm((f: any) => ({ ...f, age: parseInt(filtered) }));
              }}
              onBlur={() => {
                let value = parseInt(ageInput);
                if (isNaN(value)) value = form.age;
                if (value < 1) value = 1;
                if (value > 120) value = 120;
                setAgeInput(value.toString());
                setForm((f: any) => ({ ...f, age: value }));
              }}
              keyboardType="numeric"
              placeholder="Âge"
              placeholderTextColor="#aaa"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <ThemedText style={[styles.buttonText, { color: "#fff" }]}>
              Enregistrer
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: 1,
              },
            ]}
            onPress={handleCancel}
          >
            <ThemedText style={[styles.buttonText, { color: theme.text }]}>
              Annuler
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

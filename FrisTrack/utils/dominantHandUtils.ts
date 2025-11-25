/**
 * Converts English dominant hand values to French
 */
export function translateDominantHand(hand: string): string {
  switch (hand.toLowerCase()) {
    case "left":
      return "Gauche";
    case "right":
      return "Droite";
    case "ambidextrous":
      return "Ambidextre";
    default:
      return hand;
  }
}

/**
 * Converts French dominant hand values to English
 */
export function translateDominantHandToEnglish(
  hand: string
): "left" | "right" | "ambidextrous" {
  switch (hand) {
    case "Gauche":
      return "left";
    case "Droite":
      return "right";
    case "Ambidextre":
      return "ambidextrous";
    default:
      return "right";
  }
}

/**
 * Gets selection state from dominant hand value
 */
export function getDominantHandSelection(hand: string): {
  gauche: boolean;
  droite: boolean;
} {
  const normalized = hand.toLowerCase();
  if (normalized === "ambidextrous") {
    return { gauche: true, droite: true };
  }
  if (normalized === "left") {
    return { gauche: true, droite: false };
  }
  return { gauche: false, droite: true };
}

/**
 * Gets dominant hand value from selection state
 */
export function getDominantHandFromSelection(selection: {
  gauche: boolean;
  droite: boolean;
}): "left" | "right" | "ambidextrous" {
  if (selection.gauche && selection.droite) {
    return "ambidextrous";
  }
  if (selection.gauche) {
    return "left";
  }
  return "right";
}

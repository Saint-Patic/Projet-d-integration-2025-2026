import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
    teamLabel: string;
    score: number;
    onDelta: (delta: number) => void;
};

export default function ScoreControl({ teamLabel, score, onDelta }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{teamLabel}</Text>
            <View style={styles.controls}>
                <Pressable style={styles.button} onPress={() => onDelta(-1)}>
                    <Text style={styles.buttonText}>-1</Text>
                </Pressable>
                <Text style={styles.score}>{score}</Text>
                <Pressable style={styles.button} onPress={() => onDelta(+1)}>
                    <Text style={styles.buttonText}>+1</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', margin: 8 },
    label: { fontSize: 14, marginBottom: 6 },
    controls: { flexDirection: 'row', alignItems: 'center' },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    buttonText: { color: '#fff', fontSize: 16 },
    score: { marginHorizontal: 12, fontSize: 18, minWidth: 34, textAlign: 'center' },
});
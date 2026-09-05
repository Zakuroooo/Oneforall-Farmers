import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({
  message = 'काहीतरी चूक झाली. पुन्हा प्रयत्न करा.', // Marathi default error message (never raw English)
  onRetry,
  retryText = 'पुन्हा प्रयत्न करा',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>!</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Button
          title={retryText}
          onPress={onRetry}
          variant="outline"
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#FEB2B2',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E53E3E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  message: {
    fontSize: 16,
    color: '#C53030',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 24,
  },
  button: {
    borderColor: '#E53E3E',
    minWidth: 180,
  },
});

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { collection, getDocsFromServer, limit, query } from 'firebase/firestore';
import { auth, db } from './src/config/firebase';

export default function App() {
  const [status, setStatus] = useState('Checking Firebase connection...');

  // Temporary startup test: read from the server, without creating any data.
  useEffect(() => {
    let active = true;

    async function testConnection() {
      try {
        // Restore any existing login before evaluating Firestore access rules.
        await auth.authStateReady();
        await getDocsFromServer(query(collection(db, 'connectionTest'), limit(1)));
        if (active) setStatus('Firebase connected successfully');
      } catch (error: unknown) {
        if (active) {
          setStatus(error instanceof Error ? error.message : String(error));
        }
      }
    }

    void testConnection();
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temporary Firebase connection test</Text>
      <Text selectable>
        Project ID: {process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}
      </Text>
      <Text selectable accessibilityLiveRegion="polite">{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});

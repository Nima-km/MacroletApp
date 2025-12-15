import { FontProvider } from '@/context/FontProvider';
import migrations from '@/drizzle/migrations';
import { colors } from '@/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { openDatabaseSync, SQLiteProvider } from 'expo-sqlite';
import React, { Suspense, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export const DATABASE_NAME = 'database';


const queryClient = new QueryClient();

export default function RootLayout() {
    const expoDb = openDatabaseSync(DATABASE_NAME);
    const db = drizzle(expoDb);
    useDrizzleStudio(expoDb)
    const { success, error } = useMigrations(db, migrations);
    const [loaded, fontError] = useFonts({
        'Metro-Medium': require('@/assets/fonts/Metropolis-Medium.ttf'),
        'Metro-SemiBold': require('@/assets/fonts/Metropolis-SemiBold.ttf'),
        'Metro-Regular': require('@/assets/fonts/Metropolis-Regular.ttf'),
        'Metro-Bold': require('@/assets/fonts/Metropolis-Bold.ttf'),
        'GS-Medium': require('@/assets/fonts/general-sans/GeneralSans-Medium.otf')
    });
    useEffect(() => {
        if (success) {
            console.log('database loaded')
        }
        else
        console.log(error)
    }, [success, error]);
    if (!loaded && !error) {
        return null;
    }
    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback={<ActivityIndicator size="large" />}>
                <SQLiteProvider
                    databaseName={DATABASE_NAME}
                    options={{ enableChangeListener: true }}
                    useSuspense
                >
                    <FontProvider>
                        <GestureHandlerRootView >
                            <Stack 
                                screenOptions={{ headerShown: false,
                                    contentStyle: {
                                        backgroundColor: colors.error,
                                    },
                                }}
                            />
                        </GestureHandlerRootView>
                    </FontProvider>
                </SQLiteProvider>
            </Suspense>
        </QueryClientProvider>
    );
}

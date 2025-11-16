import { Stack } from 'expo-router';
import React, { Suspense, useEffect } from 'react';

import migrations from '@/drizzle/migrations';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { openDatabaseSync, SQLiteProvider } from 'expo-sqlite';
import { ActivityIndicator } from 'react-native';
export const DATABASE_NAME = 'database';

export default function RootLayout() {
    const expoDb = openDatabaseSync(DATABASE_NAME);
    const db = drizzle(expoDb);
    useDrizzleStudio(expoDb)
    const { success, error } = useMigrations(db, migrations);
    
    useEffect(() => {
        if (success) {
        console.log('database loaded')
        }
        else
        console.log(error)
    }, [success, error]);
    return (
        <Suspense fallback={<ActivityIndicator size="large" />}>
            <SQLiteProvider
              databaseName={DATABASE_NAME}
              options={{ enableChangeListener: true }}
              useSuspense>
            
                <Stack />
             </SQLiteProvider>
        </Suspense>
    );
}

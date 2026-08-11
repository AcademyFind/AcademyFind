'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

import { App as CapacitorApp } from '@capacitor/app';

export function useMobileApp() {
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setIsMobileApp(true);
      registerPushNotifications();
      
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if(!canGoBack){
          CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
      });
    }
  }, []);

  const registerPushNotifications = async () => {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('User denied push notification permissions');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      setPushToken(token.value);
      // Backend api integration can be done here to save the token
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
    });
  };

  return { isMobileApp, pushToken };
}

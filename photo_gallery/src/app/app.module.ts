import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideFirebaseApp(() => initializeApp({ projectId: "photogallery-b61df", appId: "1:763087409023:web:1c26505981659b7b18144a", storageBucket: "photogallery-b61df.firebasestorage.app", apiKey: "AIzaSyCFjvz8WZ5pRWqk-rDqu7pKdV6cN5NEvdY", authDomain: "photogallery-b61df.firebaseapp.com", messagingSenderId: "763087409023", measurementId: "G-5DXPY7B5DX" })), provideStorage(() => getStorage())],
  bootstrap: [AppComponent],
})
export class AppModule {}

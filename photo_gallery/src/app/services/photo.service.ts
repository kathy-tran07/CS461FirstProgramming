import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";


@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] =[];
  private PHOTO_STORAGE: string = 'photos';
  private platform: Platform;

  constructor(platform: Platform) { 
    this.platform = platform;
  }

  // convert photos in base 64  data
  private async readAsBase64(photo:Photo) {

    // detect Cordova or Capacitor for mobile
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path!
      });

      return file.data;

    } else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  })

  private async uploadToFirebase(fileName: string, base64Data: string): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `photos/${fileName}`);
    await uploadString(storageRef, base64Data, 'data_url');
    return await getDownloadURL(storageRef);
  }

  // method to save photos
  private async savePicture(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);

    if (typeof base64Data !== 'string') {
      throw new Error('Failed to convert photo to Base64 string');
    }

    const fileName = Date.now() + '.jpeg';
    const downloadUrl = await this.uploadToFirebase(fileName, base64Data);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      return {
        filepath: fileName,
        webviewPath: photo.webPath
      };
    }
  }

  // Gets the photos and parse it into an array
  public async loadSaved() {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE});
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    if (!this.platform.is('hybrid')) {
      for (let photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  // using capacitor/camera API to take a photo
  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    this.photos.unshift({
      filepath: "soon...",
      webviewPath: capturedPhoto.webPath!
    });

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  
}

// Stores photo into gallery
export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}
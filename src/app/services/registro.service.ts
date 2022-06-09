import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import { FotosService } from './fotos.service';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  coleccion:AngularFirestoreCollection<any>;
  uid:string = '';
  
  constructor(
    firestore: AngularFirestore,
    private authService:AuthService,
    private fotosService: FotosService) {
      this.coleccion = firestore.collection('usuarios');
  }

  registrarEspecialista(datos:any) {
    this.authService.SignUp(datos.email, datos.clave)
      .then(uc => {
        if (uc.user) {
          this.uid = uc.user.uid;

          return this.fotosService.subir(this.uid, datos.foto);
        }
        throw "Sin uid";
      })
      .then(
        uts => uts.ref.getDownloadURL()
      )
      .then(
        url => {
          const documento = {
            rol: 'especialista',
            email: datos.email,
            nombre: datos.nombre,
            apellido: datos.apellido,
            edad: datos.edad,
            dni: datos.dni,
            especialidades: datos.especialidades,
            foto: url
          }
          this.coleccion.doc(this.uid).set(documento);
        }
      )
      .then(
        () => this.authService.SendVerificationMail()
      )
      .catch(
        err => console.log(err.message)
      );
  }

  registrarPaciente(datos:any) {
    const urlArray: string[] = [];

    this.authService.SignUp(datos.email, datos.clave)
      .then(uc => {
        if (uc.user) {
          this.uid = uc.user.uid;

          return this.fotosService.subir(this.uid + '1', datos.fotos[0]);
        }
        throw "Sin uid";
      })
      .then(
        uts => uts.ref.getDownloadURL()
      )
      .then(
        url => urlArray.push(url)
      )
      .then(
        () => this.fotosService.subir(this.uid + '2', datos.fotos[1])
      )
      .then(
        uts => uts.ref.getDownloadURL()
      )
      .then(
        url => urlArray.push(url)
      )
      .then(
        () => {
          const documento = {
            rol: 'paciente',
            email: datos.email,
            nombre: datos.nombre,
            apellido: datos.apellido,
            edad: datos.edad,
            dni: datos.dni,
            obraSocial: datos.obraSocial,
            fotos: urlArray
          }
          this.coleccion.doc(this.uid).set(documento);
        }
      )
      .then(
        () => this.authService.SendVerificationMail()
      )
      .catch(
        err => console.log(err.message)
      );
  }
}

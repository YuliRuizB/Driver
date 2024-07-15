import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as firebase from 'firebase/compat/app';
import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNow, format, endOfMonth, endOfDay, startOfDay, startOfMonth, addBusinessDays, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
// import * as moment from 'moment';
// import * as tz from "moment-timezone";
// import 'moment-timezone';
import * as moment from 'moment-timezone'
@Injectable({
  providedIn: 'root'
})

export class BoardingPassesService {

  globalConfig: any;
  user: any;

  constructor(private afs: AngularFirestore) {
    const config = firebase.default.firestore().collection('aboutus').doc('globalConfig');
    config.get().then((querySnapshot) => {
      if (querySnapshot.exists) {
        this.globalConfig = querySnapshot.data();
      
      }
    })
  }

  async validate(qrCodeData: string, program: any) {
    
    let code = (qrCodeData).split('-');
    
    /*if(code.length === 1) {
      code = (qrCodeData).split(':');
      console.log('code length is: ', JSON.stringify(code), code.length);
    }*/
   
    const userId = code[0];
    const boardingPassId = code[1];
    let isCredential = false;
    const user = firebase.default.firestore().collection('users').doc(userId);
    return await user.get().then(async (querySnapShot) => {

      if (querySnapShot.exists) {

        this.user = querySnapShot.data();

        const isUserDisabled = this.user.disabled || false;

        if (!isUserDisabled) {

          if (code.length === 3) { isCredential = code[2] === 'C'; }
          if (isCredential) {
			
            const credential: any = await this.validateCredential(userId, boardingPassId, program);
            credential.isCredential = true;
            credential.credentialId = boardingPassId;
            credential.code = qrCodeData;
            credential.programId = program.id;
            return credential;
          } else {
          
            const boardingPass: any = await this.validateBoardingPass(userId, boardingPassId, program);
           
            boardingPass.isCredential = false;
            boardingPass.credentialId = null;
            boardingPass.code = qrCodeData;
            boardingPass.programId = program.id;
						// boardingPass[]
            return boardingPass;
          }

        } else {

          const message = {
            success: false,
            type: 'userDisabled',
            title: 'Usuario deshabilitado',
            studentId: this.user.studentId,
            studentName: this.user.displayName,
            studentEmail: this.user.email,
            uid: this.user.uid,
            boardingPassId: null,
            isBoardingPassValid: false,
            timestamp: this.user.lastUpdatedAt || Timestamp.fromDate(new Date()),
            message: 'Su cuenta está deshabilitada. Presentarse en oficinas Bus2U a revisar su cuenta'
          };

          return message;
        }

      } else {

        const message = {
          success: false,
          type: 'noUser',
          title: 'Usuario no existe',
          studentId: 'inválido',
          studentName: 'inválido',
          studentEmail: 'invalido',
          uid: 'no existe',
          boardingPassId: 'no existe',
          isBoardingPassValid: false,
          timestamp: Timestamp.fromDate(new Date()),
          message: 'Presentarse en oficinas Bus2U a revisar su información'
        };

        return message;
      }
    })

  }

  async validateCredential(userId: string, credentialId: string, program: any) {

    let message = {};
    const isValid: any = await this.isValidCredential(userId, credentialId, program);
  

    const today = startOfDay(new Date());
    const maxAllowanceDate = addBusinessDays(startOfMonth(endOfDay(today)), this.globalConfig.maxAllowanceDays || 3);
    const isWithinAllowance = isBefore(today, maxAllowanceDate);
    const actualKey = `${credentialId}${program.type}${new Date().getFullYear()}${new Date().getMonth()}${new Date().getDate()}`;
   

    if (!isValid.success) {

      const isExpiredCredential = isValid.type == 'expired';
      const isExpiredWithinAllowance = isBefore(isValid.timestamp, maxAllowanceDate);

      if (isExpiredCredential && isExpiredWithinAllowance) {

        message = {
          success: true,
          type: 'extension',
          title: 'Prórroga',
          studentId: this.user.studentId,
          studentName: this.user.displayName,
          studentEmail: this.user.email,
          uid: this.user.uid,
          boardingPassId: null,
          isBoardingPassValid: false,
          actualKey,
          allowedOnBoard: true,
          timestamp: Timestamp.fromDate(new Date()),
          message: `Tu credencial ya expiró. Tu prórroga expira ${formatDistanceToNow(maxAllowanceDate, { addSuffix: true, locale: es })}. Es necesario comprar un pase de abordar.`
        };

        return message;

      } else {
        return isValid;
      }
    }


    const endOfThisMonth = endOfMonth(endOfDay(today));
   
    const boardingPass = firebase.default.firestore().collection('users').doc(userId).collection('boardingPasses')
      .where('validTo', '>', today).where('validTo', '<', endOfThisMonth).limit(1); //.where('active','==', true)
    return await boardingPass.get().then(querySnapshot => {

      if (querySnapshot.empty) {

        if (isWithinAllowance) {

          message = {
            success: true,
            type: 'extension',
            title: 'Prórroga',
            studentId: this.user.studentId,
            studentName: this.user.displayName,
            studentEmail: this.user.email,
            uid: this.user.uid,
            boardingPassId: null,
            isBoardingPassValid: false,
            allowedOnBoard: true,
            actualKey,
            timestamp: Timestamp.fromDate(new Date()),
            message: `Tu pase de abordar ya expiró. Tu prórroga expira ${formatDistanceToNow(maxAllowanceDate, { addSuffix: true, locale: es, })}. Es necesario comprar un pase de abordar.`
          };

          return message;

        } else {

          message = {
            success: false,
            type: 'noBoardingPass',
            title: 'Vencido',
            studentId: this.user.studentId,
            studentName: this.user.displayName,
            studentEmail: this.user.email,
            uid: this.user.uid,
            boardingPassId: null,
            isBoardingPassValid: false,
            actualKey,
            timestamp: Timestamp.fromDate(new Date()),
            message: 'Presentarse en oficinas Bus2U a revisar sus pagos'
          };

          return message;
        }
      }

      const docs = querySnapshot.docs;
      
      const doc = docs[0];
      const boardingPassId = doc.id;
      const isValidBoardingPass = this.validateBoardingPass(userId, boardingPassId, program);
      return isValidBoardingPass;
    });
  }

  async isValidCredential(userId: string, credentialId: string, program: any) {
    const credential = firebase.default.firestore().collection('users').doc(userId).collection('credentials').doc(credentialId);
    return await credential.get().then((querySnapshot) => {

      let message = {};

      if (querySnapshot.exists) {
        const data: any = querySnapshot.data();
       
        const today = startOfDay(new Date());
        const validFrom = startOfDay(data.validFrom.toDate());
        const validTo = endOfDay(data.validTo.toDate());
        const actualKey = `${credentialId}${program.type}${new Date().getFullYear()}${new Date().getMonth()}${new Date().getDate()}`;

        if (!data.active) {
          message = {
            success: false,
            type: 'inactive',
            title: 'Credencial desactivada',
            studentId: this.user.studentId,
            studentName: this.user.displayName,
            studentEmail: this.user.email,
            uid: this.user.uid,
            boardingPassId: null,
            isBoardingPassValid: false,
            actualKey,
            timestamp: data.disabledAt,
            message: data.disabledInstructions
          }
          return message;
        }

        if (data.disabled) {
          message = {
            success: false,
            type: data.disabledType,
            title: data.disabledReasons,
            studentId: this.user.studentId,
            studentName: this.user.displayName,
            studentEmail: this.user.email,
            uid: this.user.uid,
            boardingPassId: null,
            isBoardingPassValid: false,
            actualKey,
            timestamp: data.disabledAt,
            message: data.disabledInstructions
          }
          return message;
        }

        const isStillValidCredential = today > validFrom && today < validTo;

        if (!isStillValidCredential) {
          message = {
            success: false,
            type: 'expired',
            title: 'Credencial expirada',
            studentId: this.user.studentId,
            studentName: this.user.displayName,
            studentEmail: this.user.email,
            uid: this.user.uid,
            boardingPassId: null,
            isBoardingPassValid: false,
            actualKey,
            timestamp: Timestamp.fromDate(validTo),
            message: 'Presentarse en oficinas Bus2U a renovar la credencial'
          };
          return message;
        }

   
        let lastUserKey = '';
        if (data && data.passValidation && data.passValidation.validation) {
          lastUserKey = data.passValidation.validation;
        }
        const hasBeenUsedToday = actualKey === lastUserKey && !!data.passValidation.lastValidUsage;

        if (hasBeenUsedToday) {

          const timeDistance = formatDistanceToNow(
            (data.passValidation.lastUsed).toDate(), {
            includeSeconds: true,
            addSuffix: false,
            locale: es
          }
          );
          const timeFormat = format(
            (data.passValidation.lastUsed).toDate(),
            'h:mm a',
            { locale: es }
          );

          const programType = program.program === 'M' ? 'ida' : 'regreso';

          message = {
            success: false,
            type: 'duplicated',
            title: 'Duplicado',
            studentId: this.user.studentId,
            studentName: this.user.displayName,
            studentEmail: this.user.email,
            uid: this.user.uid,
            boardingPassId: null,
            isBoardingPassValid: null,
            actualKey,
            timestamp: Timestamp.fromDate((data.passValidation.lastUsed).toDate()),
            message: `Tu pase ya ha sido usado el día de hoy de ${programType} hace ${timeDistance} (${timeFormat}) en la unidad ${data.passValidation.lastUsedVehicle}`
          };
	
          return message;

        }

        message = {
          success: true,
          type: 'valid'
        };

        return message;

      }

      message = {
        success: false,
        type: 'unknown',
        title: 'No registrada',
        studentId: this.user.studentId,
        studentName: this.user.displayName,
        studentEmail: this.user.email,
        uid: this.user.uid,
        boardingPassId: null,
        isBoardingPassValid: false,
        actualKey: null,
        timestamp: Timestamp.fromDate(new Date()),
        message: 'Presentarse en oficinas Bus2U para revisar la credencial'
      };

      return message;
    });
  }

  async validateBoardingPass(userId: string, boardingPassId: string, program: any) {


    const boardingPass = firebase.default.firestore().collection('users').doc(userId).collection('boardingPasses').doc(boardingPassId);
    return await boardingPass.get().then(querySnapshot => {

      const boardingPass = querySnapshot.data();
      const boardingPassId = querySnapshot.id;
		
			// console.log(boardingPass.idBoardingPass)
     
      let message = {};

      if (querySnapshot.exists) {

        const boardingPassValidFrom = boardingPass.validFrom.toDate();
        const boardingPassValidTo = boardingPass.validTo.toDate();
        let date = new Date();
        let today = new Date(date.setDate(date.getDate() - 1));
        const isBoardingPassValid = new Date() >= boardingPassValidFrom && today <= boardingPassValidTo && boardingPass.active;

        if (isBoardingPassValid) {
	
          const actualKey = `${boardingPassId}${program.type}${new Date().getFullYear()}${new Date().getMonth()}${new Date().getDate()}`;
    
          let lastUserKey = '';
          if (boardingPass && boardingPass.passValidation && boardingPass.passValidation.validation) {
			
            
						// moment().t
						let date1  = moment(boardingPass.passValidation.callDateFunction).tz("America/Monterrey").format() 
						let date2 = moment().tz("America/Monterrey").format() 
						let date3 = moment(date2).diff(moment(date1), 'hours');
						if (date3 <= 2) {
							lastUserKey = boardingPass.passValidation.validation;
						}else{
							lastUserKey = '';
						}
						//moment.tz(boardingPass.passValidation.callDateFunction, "America/Monterrey").format();
						// let minutes = date1.diff(date2, 'minutes');

          }

          const hasBeenUsedToday = actualKey === lastUserKey && !!boardingPass.passValidation.lastValidUsage;

          if (!hasBeenUsedToday) {

            const customerAccount = firebase.default.firestore().collection('customers').doc(boardingPass.customerId);
            return customerAccount.get().then(async (querySnapShot) => {
						
              if (querySnapShot.exists) {
							

                const userCustomerAccount = querySnapShot.data();
                const forceRound = userCustomerAccount.forceRound === "true";
                const forceRoute = userCustomerAccount.forceRoute === "true";
                const forceStopPoints = userCustomerAccount.forceStopPoints === "true";

                const isSameRoute = forceRoute ? program.routeId === boardingPass.routeId : true;
                const isSameRound = forceRound ? program.round === boardingPass.round : true;
                const isCorrectMatch = isSameRoute && isSameRound;

                if (isCorrectMatch) {
			
                  const arrayUserFullName = this.user.displayName.split(' ');
                  const userFirstName = arrayUserFullName[0];

                  message = {
                    success: true,
                    type: 'welcome',
                    title: program.round === 'Día' ? `Buenos días ${userFirstName}` : `Buenas tardes ${userFirstName}`,
                    studentId: this.user.studentId,
                    studentName: this.user.displayName,
                    studentEmail: this.user.email,
                    uid: this.user.uid,
                    boardingPassId,
                    isBoardingPassValid,
                    actualKey,
                    allowedOnBoard: true,
                    timestamp: Timestamp.fromDate(new Date()),
                    message: `Bienvenido, gracias por preferir nuestro servicio`
                  };

                  return message;

                } else {
					
                  if (!isSameRoute) {

                    message = {
                      success: false,
                      type: 'route',
                      // title: 'Ruta incorrecta',
											title: 'RUTA INCORRECTA. Estas tratando de abordar una ruta que no te corresponde',
                      studentId: this.user.studentId,
                      studentName: this.user.displayName,
                      studentEmail: this.user.email,
                      uid: this.user.uid,
                      boardingPassId,
                      isBoardingPassValid,
                      actualKey,
                      timestamp: Timestamp.fromDate(new Date()),
                      message: `Esta es la ruta de ${program.routeName} y tu pase de abordar es de la ruta ${boardingPass.routeName}`
                    };

                    return message;

                  } else {
							
                    message = {
                      success: false,
                      type: 'round',
                      // title: 'Turno incorrecto',
											title: 'TURNO INCORRECTO. Estas tratando de abordar en un turno no correspondiente.',
                      studentId: this.user.studentId,
                      studentName: this.user.displayName,
                      studentEmail: this.user.email,
                      uid: this.user.uid,
                      boardingPassId,
                      isBoardingPassValid,
                      actualKey,
                      timestamp: Timestamp.fromDate(new Date()),
                      message: `Esta unidad ejecuta el turno de ${program.round} y tu pase de abordar es para el turno de ${boardingPass.round}`
                    };

                    return message;

                  }

                }
              }
            })

          } else {
					
            const timeDistance = formatDistanceToNow(
              (boardingPass.passValidation.lastUsed).toDate(), {
              includeSeconds: true,
              addSuffix: false,
              locale: es
            }
            );
            const timeFormat = format(
              (boardingPass.passValidation.lastUsed).toDate(),
              'h:mm a',
              { locale: es }
            );
						
						/*if (boardingPass.passValidation.dateScan === undefined) {
							boardingPass.passValidation['dateScan'] = moment().format();
						}*/
            const programType = program.type === 'M' ? 'ida' : 'regreso';

            message = {
              success: false,
              type: 'duplicated',
              title: 'Duplicado',
              studentId: this.user.studentId,
              studentName: this.user.displayName,
              studentEmail: this.user.email,
              uid: this.user.uid,
              boardingPassId,
              isBoardingPassValid,
              actualKey,
              timestamp: Timestamp.fromDate(boardingPass.passValidation.lastUsed.toDate()),
              message: `Tu pase ya ha sido usado el día de hoy de ${programType} hace ${timeDistance} (${timeFormat}) en la unidad ${boardingPass.passValidation.lastUsedVehicle}`
            };
		
            return message;
          }

        } else {

					if (boardingPass.active == false) {
						message = {
							success: false,
							type: 'suspended',
							// title: 'Inválido',
							title: 'SUSPENDIDO. Este QR ha sido deshabilitado por falta de pago',
							studentId: this.user.studentId,
							studentName: this.user.displayName,
							studentEmail: this.user.email,
							uid: this.user.uid,
							boardingPassId,
							isBoardingPassValid,
							actualKey: 'sin información',
							timestamp: boardingPass.lastUpdatedAt || Timestamp.fromDate(new Date()),
							message: 'Presentarse en oficinas Bus2U para revisar sus pases activos'
						};
					}else{
						message = {
							success: false,
							type: 'overduePayment',
							// title: 'Inválido',
							title: 'PAGO VENCIDO. Favor de presentarse en oficinas para realizar el pago correspondiente',
							studentId: this.user.studentId,
							studentName: this.user.displayName,
							studentEmail: this.user.email,
							uid: this.user.uid,
							boardingPassId,
							isBoardingPassValid,
							actualKey: 'sin información',
							timestamp: boardingPass.lastUpdatedAt || Timestamp.fromDate(new Date()),
							message: 'Presentarse en oficinas Bus2U para revisar sus pases activos'
						};
					}

          return message;
        }

      } else {
		
        message = {
          success: false,
          type: 'unknown',
          // title: 'No encontrado',
					title: 'QR INVALIDO. Presentarse en oficinas',
          studentId: this.user.studentId,
          studentName: this.user.displayName,
          studentEmail: this.user.email,
          uid: this.user.uid,
          boardingPassId: null,
          isBoardingPassValid: false,
          actualKey: 'sin información',
          timestamp: Timestamp.fromDate(new Date()),
          message: 'Presentarse en oficinas Bus2U para revisar sus pagos'
        };

        return message;
      }
    })
  }
}

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as firebase from 'firebase/compat/app';
import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNow, format, endOfMonth, endOfDay, startOfDay, startOfMonth, addBusinessDays, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

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
        console.log(this.globalConfig);
      }
    })
  }

  async validate(qrCodeData: string, program: any) {
    console.log('program: ', program);
    let code = (qrCodeData).split('-');
    console.log('code read is: ', qrCodeData);
    /*if(code.length === 1) {
      code = (qrCodeData).split(':');
      console.log('code length is: ', JSON.stringify(code), code.length);
    }*/
    console.log('code length is: ', JSON.stringify(code), code.length);
    const userId = code[0];
    const boardingPassId = code[1];
		console.log('paso 22')
    let isCredential = false;
		console.log('esto envia')
		console.log(userId)
    const user = firebase.default.firestore().collection('users').doc(userId);
    return await user.get().then(async (querySnapShot) => {
			console.log('el query snap');
			console.log(querySnapShot.exists);
			console.log(querySnapShot.data());
      if (querySnapShot.exists) {

        this.user = querySnapShot.data();

        const isUserDisabled = this.user.disabled || false;

        if (!isUserDisabled) {

          if (code.length === 3) { isCredential = code[2] === 'C'; }
          if (isCredential) {
						console.log('paso20')
            console.log('isCredential', isCredential);
            const credential: any = await this.validateCredential(userId, boardingPassId, program);
            credential.isCredential = true;
            credential.credentialId = boardingPassId;
            credential.code = qrCodeData;
            credential.programId = program.id;
            return credential;
          } else {
            console.log('if not, the isBoardingPass');
            const boardingPass: any = await this.validateBoardingPass(userId, boardingPassId, program);
            console.log('returned message from method: ', boardingPass);
						console.log('paso 21')
						console.log(boardingPass)
            boardingPass.isCredential = false;
            boardingPass.credentialId = null;
            boardingPass.code = qrCodeData;
            boardingPass.programId = program.id;
						
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
    console.log(isValid);

    const today = startOfDay(new Date());
    const maxAllowanceDate = addBusinessDays(startOfMonth(endOfDay(today)), this.globalConfig.maxAllowanceDays || 3);
    const isWithinAllowance = isBefore(today, maxAllowanceDate);
    const actualKey = `${credentialId}${program.type}${new Date().getFullYear()}${new Date().getMonth()}${new Date().getDate()}`;
    console.log('is within allowance date: ', isWithinAllowance);

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
    console.log(endOfThisMonth);
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
      console.log(docs);
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
        console.log(data);
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

        console.log(actualKey);
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
					console.log('regresa el duplicado');
					console.log(message)
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
		console.log('driver id check qr');
		console.log(userId);
		console.log(boardingPassId);
		console.log(program)

    const boardingPass = firebase.default.firestore().collection('users').doc(userId).collection('boardingPasses').doc(boardingPassId);
    return await boardingPass.get().then(querySnapshot => {

      const boardingPass = querySnapshot.data();
      const boardingPassId = querySnapshot.id;
			console.log('esto bording');
			console.log(boardingPassId)
			// console.log(boardingPass.idBoardingPass)
      console.log('this is the data for the boardingPass acquired: ', boardingPass);
      let message = {};

      if (querySnapshot.exists) {

        const boardingPassValidFrom = boardingPass.validFrom.toDate();
        const boardingPassValidTo = boardingPass.validTo.toDate();
        let date = new Date();
        let today = new Date(date.setDate(date.getDate() - 1));
        const isBoardingPassValid = new Date() >= boardingPassValidFrom && today <= boardingPassValidTo && boardingPass.active;
        console.log('isBoardingPassValid, ', isBoardingPassValid);
				console.log('paso 1');
				console.log(isBoardingPassValid)
        if (isBoardingPassValid) {
					console.log('paso 4');
          const actualKey = `${boardingPassId}${program.type}${new Date().getFullYear()}${new Date().getMonth()}${new Date().getDate()}`;
          console.log(actualKey);
          let lastUserKey = '';
          if (boardingPass && boardingPass.passValidation && boardingPass.passValidation.validation) {
						console.log('paso 5');
            lastUserKey = boardingPass.passValidation.validation;
          }
          const hasBeenUsedToday = actualKey === lastUserKey && !!boardingPass.passValidation.lastValidUsage;
					console.log('paso 6');
					console.log(hasBeenUsedToday)
          if (!hasBeenUsedToday) {
						console.log('paso 7');
						console.log(boardingPass.customerId)
            const customerAccount = firebase.default.firestore().collection('customers').doc(boardingPass.customerId);
            return customerAccount.get().then(async (querySnapShot) => {
							console.log('paso 8');
              if (querySnapShot.exists) {
								console.log('paso 9');
                console.log('account Exists: ', customerAccount);

                const userCustomerAccount = querySnapShot.data();
                const forceRound = userCustomerAccount.forceRound === "true";
                const forceRoute = userCustomerAccount.forceRoute === "true";
                const forceStopPoints = userCustomerAccount.forceStopPoints === "true";

                const isSameRoute = forceRoute ? program.routeId === boardingPass.routeId : true;
                const isSameRound = forceRound ? program.round === boardingPass.round : true;
                const isCorrectMatch = isSameRoute && isSameRound;
								console.log('paso 10');
                console.log('isCorrectMatch: ', isCorrectMatch);
                if (isCorrectMatch) {
									console.log('paso 11');
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
									console.log('paso 12');
                  console.log('isSameRoute?', isSameRoute)
                  if (!isSameRoute) {

                    message = {
                      success: false,
                      type: 'route',
                      title: 'Ruta incorrecta',
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
										console.log('paso 13');
                    message = {
                      success: false,
                      type: 'round',
                      title: 'Turno incorrecto',
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
						console.log('paso 14');
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
						console.log('paso 15');
						console.log(message)
            return message;
          }

        } else {
					console.log('paso2')
          message = {
            success: false,
            type: 'invalid',
            title: 'Inválido',
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

          return message;
        }

      } else {
				console.log('paso3')
        message = {
          success: false,
          type: 'unknown',
          title: 'No encontrado',
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

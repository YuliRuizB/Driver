import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

  loginForm: FormGroup;
  
  constructor( 
    private fb: FormBuilder,
    private authService: AuthService
    ) { 
    this.loginForm = this.fb.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
		});
  }

  ngOnInit() {
  }

  signin() {
    if(this.loginForm.valid) {
      this.authService.signin(this.loginForm.value);
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
declare var FB: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'client';

  constructor(private dataService: DataService) {}

  ngOnInit() {
    (window as any).fbAsyncInit = function () {
      FB.init({
        appId: '272887017115623',
        cookie: true,
        xfbml: true,
        version: 'v7.0',
      });

      FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }

  linkedinLogin() {
    this.dataService.linkedinSignup();
  }

  submitLogin() {
    console.log('submit login to facebook');
    // FB.login();
    FB.login((response) => {
      console.log('submitLogin', response);
      if (response.authResponse) {
        console.log(response.authResponse);
        //login success
        //login success code here
        //redirect to home page
      } else {
        console.log('User login failed');
      }
    });
  }
  biltyLogin() {
    return this.dataService.bitlyLogin();
  }

  twitterLogin() {
    return this.dataService.twitterLogin();
  }
}

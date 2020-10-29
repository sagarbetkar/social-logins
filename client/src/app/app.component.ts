import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { DataService } from './services/data.service';
import { NotificationService } from './services/notification.service';
import { HttpClient } from '@angular/common/http';
declare var FB: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'client';
  facebook_token: any = {
    first_name: 'Sagar',
    last_name: 'Betkar',
    access_token: null,
  };
  constructor(
    private dataService: DataService,
    private notifyService: NotificationService,
    private cd: ChangeDetectorRef
  ) {}

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
        this.dataService
          .facebookLongLivedAccessToken(response.authResponse.accessToken)
          .subscribe(
            (token: any) => {
              console.log(token);
              this.facebook_token.access_token = token.access_token;
              this.cd.markForCheck();
            },
            (error) => {
              console.log(error);
            }
          );
        //login success
        this.notifyService.showSuccess(
          'User logged in successfully',
          'Facebook Login'
        );
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

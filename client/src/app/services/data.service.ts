import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { secretDetails } from 'config';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  linkedinSignup() {
    /* this.http
      .get('https://www.linkedin.com/oauth/v2/authorization', {
        params: {
          response_type: 'code',
          client_id: secretDetails.Linkedin_Client_Id,
          redirect_uri: secretDetails.redirect_uri,
          scope: 'r_liteprofile r_emailaddress',
        },
      })
      .toPromise(); */
    console.log('Hit');
    window.open(
      'https://7699e7a4da58.ngrok.io/linkedin',
      'LinkedIn Login',
      `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width=0,height=0,left=-1000,top=-1000`
    );
  }

  bitlyLogin() {
    window.open(
      `https://7699e7a4da58.ngrok.io/bitly`,
      'Bitly Login',
      `crollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width = 0, height = 0, left = -1000, top = -1000`
    );
  }

  twitterLogin() {
    window.open(
      `https://7699e7a4da58.ngrok.io/twitter`,
      'Twitter Login',
      `crollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width = 0, height = 0, left = -1000, top = -1000`
    );
  }
}

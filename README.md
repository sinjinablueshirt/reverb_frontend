# Reverb Frontend
<!--
This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
``` -->

## Screen Recording

[click here for the recording](https://youtu.be/BEZr5AArdlI)

Iʻm sorry the recording is so long! I wanted to illustrate the two full user journeys of this app. For the sake of time, I diverged from the specific story I crafted in the User Journeys section below, but the ideas and flow of user actions are the same.

## User Journeys

I illustrate two short journeys to show both key user roles: a composer and a commenter.

## Pikachu's Journey (Composer)

Pikachu just finished drafting his first ever piece of music, an ambitious piece that utilizes a full symphony orchestra. Pikachu wants to get feedback to improve this piece so that it not only sounds good but also feels good to play. However, his friends only play string instruments, and he doesn't know any woodwind, brass, or percussion players.

Pikachu as a result goes to Reverb with the goal of getting diverse, easily parseable feedback on his brass, wind, and percussion parts so that he can later go on to iterate on his piece.

Once logging in, Pikachu finds himself on the Home Page. Pikachu clicks on the + button under his music to navigate to the Upload Page. Pikachu titles his piece and gives a description, saying that this is his first ever full composition. Under the description, Pikachu adds the tags: woodwind, brass, percussion. Pikachu uploads a pdf of the score on the right side. He designates his piece as public so that he can get as many suggestions as possible. He clicks post to let others see his work

*A few days later*

Pikachu logs back onto Reverb and checks his home page. He clicks on his composition which is in his music list. On the View Page, he looks to the bottom right to take a look at any comments that others left. He can see a dozen comments. He sees tags like "difficult" and "awkward" specifically paired with the percussion tag. This lets Pikachu know that he needs to take a deeper look at his percussion parts when reworking his composition. He is glad that he was able to determine what he needs to work on on these parts that he is less familiar with.

Pikachu clicks on the edit button on the View Page to navigate to the Upload page, where he switches his piece to private so that no other comments come in while he's working on his second iteration.


## Bulbasaur's Journey (Commenter)
Bulbasaur is a decently experienced composer, but wants to improve his skills specifically in arranging percussion music. However, he doesn't know many percussionists with whom to get advice from. Bulbasaur knows that one of the best ways to hone a skill is by giving others help on it, but he doesn't know anyone in need of help on specifically percussion music.

Thus, Bulbasaur goes on Reverb to get ideas on percussion music and "learn by teaching".

Bulbasaur logs in and starts on the Home Page. He clicks on the search bar on the top and uses a "percussion" tag to see if he can find anyone looking for help on percussion music. One of the top results is a piece by a user named Pikachu who is apparently new to composing which catches his eye. He clicks on Pikachu's post and navigates to the Feedback page.

After flipping through the sheet music, Bulbasaur finds that Pikachu's percussion parts are quite difficult and uncomfortable to play. He identifies specific parts that he feels would need to be changed and suggests what he would do instead. He outlines all these in a couple comments with tags like "percussion" and "difficult".

Bulbasaur ends up feeling not only accomplished for helping someone else out, but also more knowledgeable and confident about composing music for percussion players. Now that he's seen the errors that others make in percussion music, he knows to look out for them in his own work.

## Notes
Because Reverb serves both composers and commenters, I included two journeys to illustrate the app’s features from each perspective. I know the end result is super long, but I hope it adequately describes the journey of the users.

## Big changes (so far)
1. added queries to concepts in order to access things. initially queries took in arguments like normal but had to change so they took in JSON-like objects (and returned json objects)
2. needed to change way files work. cannot use file paths. since backend cant just acceess the local files. changed fileurl. split the uploadfile action into two actions, requestupload and confirmupload.
3. added a new action to FileUrl that basically gets a viewUrl every time we want to display the pdf
4. had to rework the entire suggestTags action. it now takes in a description and tags and returns the suggested set of tags

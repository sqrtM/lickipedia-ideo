## lickipedia 
### a twitter-style approach to sharing and saving your favorite licks.

made possible through the wonders of the [abc music notation](https://abcnotation.com/), paul rosen's [abcjs](https://github.com/paulrosen/abcjs), and a couple peeks at rigo bauer's [react snippets](https://github.com/rigobauer/react-abcjs) (this stuff was surprisingly tricky to get to render in react and keep unique refs and ids etc etc). the notation itself is hosted on a postgres server and controlled via [my PHP controller](https://github.com/sqrtM/lickiPHPedia).

![image](https://user-images.githubusercontent.com/79169638/199057720-836f78f7-b2f9-416e-adcd-e06d7c387581.png)

built with next.js and typescript

## features 
currently, there is 
1. a fairly robust collapsable in-browser editor for composing your own music in real time
2. the ability to save your favorite licks to the sidebar for easy access
3. the ability to "fork" licks, giving you a full copy of the original lick to edit, which will then show the parent ID of the lick you forked it from, allowing you to trace the lineage of an idea back, sort of like how it works on something like glslSandbox.
4. the ability to transpose all licks on your feed, making it extra easy to learn your next cool ii-V-I in all 12 keys.
5. a postgres backend to save all of your licks for future reference

soon, there will be 
1. logins and users. licks will probably remain anon, but i want users to be able to save their own licks and other cool licks they find for future reference.
2. easy downloading of the svg files, so you can print them.
3. better editor.

there will be more cool stuff to come, as well!

## want to try ? 
i'm currently having some issues getting everything deployed properly (vercel having some issues at compile time with the abcjs api...). I may just ship it soon as an electron app so it can also just run locally and save to the user's hard drive as well as connect to a global postgres db.

in the meantime, i'm in the process of moving the app to vite and deploying it on github pages as a SPA. we'll see. anyway.

thanks, and happy practicing! 

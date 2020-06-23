Project URL: https://frill-corn.glitch.me

OpenRadio is a system where the admin can create multiple radio stations for users to listen into by inputing youtube urls(defintley going to expand). Everyone listening to hte radio station should be at approximatley the same time as everyone else(last test resulted in 1 to 3 second difference). It comes with a nice admin panel that you can configure the password in. It's also open-source on github(I wouldn't call it openradio if it wasn't) at https://github.com/javaarchive/OpenRadio/tree/glitch
You can create a new project from github and configure these values in .env and your OpenRadio instance should be setup. Feel free to delete coding playlist and testing playlist. Make sure to set these values in .env
![image|515x500](upload://5xXblWOJMI3B3Z56OzeIlgOuKW2.png)
You don't need to set `MADE_WITH` but `PASSWORD` is the admin password and `SECRET` is your secret for session cookies. There's also a whole lot more config in `config.js`
There are a few annoying bugs and issues which I have described in my latest release: https://github.com/javaarchive/OpenRadio/releases/tag/V2.0.0

The system is designed to use infinite mp3 streams so you can have your devices stream https://yourglitchurl/stream/(stream name here)
I use this technique for my google home and my amazon alexa. You can also setup discord bots to stream from it by copying a bit of code from discordjs's documentation.

# Inspiration

I think I got inspiration when Ben or Electric Reality on discord sent a idea for a service that gives you music streams. Using python this wasn't really possible but with nodejs streams and rate-limiting this was made possible!

# Screenshots

![image|690x348](upload://sbgT6fDQYyrtiF48Pzbee7BGljE.png)
Control click play button to show audio element
![image|690x224](upload://fpxSIOrR6jevQRTsSgulBPyxf59.png)
![image|690x187](upload://gHTqLip8ht6pg92zrm1El5yvtgm.png)
![image|690x184](upload://sVFESkrpwMiYsiaFh2TZeWavZfN.png)
pretty proud of this screen
![image|690x401](upload://b5qgTymjw0M3MNLKxFm61232FXy.png)
![image|690x248](upload://9wln6wcOcOoR9MpjvGBFsluCSf3.png)

# Customization

This is very customizable as all the templates are in one directory I think. There is also a template that "wraps" on top of the other templates which includes the topbar.

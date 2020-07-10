Project URL: https://frill-corn.glitch.me

OpenRadio is a system where the admin can create multiple radio stations for users to listen into by inputing youtube urls(defintley going to expand). Everyone listening to hte radio station should be at approximatley the same time as everyone else(last test resulted in 1 to 3 second difference). It comes with a nice admin panel that you can configure the password in. It's also open-source on github(I wouldn't call it openradio if it wasn't) at https://github.com/javaarchive/OpenRadio/tree/glitch
You can create a new project from github and configure these values in .env and your OpenRadio instance should be setup. Feel free to delete coding playlist and testing playlist. Make sure to set these values in .env
![image|515x500](https://aws1.discourse-cdn.com/business6/uploads/glitch/original/2X/2/26e174f9970d1c2934402ddec18e3c629dbbda36.png)
You don't need to set `MADE_WITH` but `PASSWORD` is the admin password and `SECRET` is your secret for session cookies. There's also a whole lot more config in `config.js`
There are a few annoying bugs and issues which I have described in my latest release: https://github.com/javaarchive/OpenRadio/releases/tag/V2.0.0

The system is designed to use infinite mp3 streams so you can have your devices stream https://yourglitchurl/stream/(stream name here)
I use this technique for my google home and my amazon alexa. You can also setup discord bots to stream from it by copying a bit of code from discordjs's documentation.

# Inspiration

I think I got inspiration when Ben or Electric Reality on discord sent a idea for a service that gives you music streams. Using python this wasn't really possible but with nodejs streams and rate-limiting this was made possible!

# Screenshots

![image|690x348](https://aws1.discourse-cdn.com/business6/uploads/glitch/original/2X/c/c5831337dd3a7a12b81c32bbe372651e43608fb6.png)
Control click play button to show audio element
![image|690x224](https://aws1.discourse-cdn.com/business6/uploads/glitch/optimized/2X/6/6c03e1a21717cd1355edb3018d9482d60ce550f3_2_690x224.png)
![image|690x187](https://aws1.discourse-cdn.com/business6/uploads/glitch/optimized/2X/7/751900a40f395403f8cad076ebf8104c7af87332_2_690x187.png)
![image|690x184](https://aws1.discourse-cdn.com/business6/uploads/glitch/optimized/2X/c/cac1cc48a1a4daa52c0bc2ac85a702ba42c1892f_2_690x184.png)
pretty proud of this screen
![image|690x401](https://aws1.discourse-cdn.com/business6/uploads/glitch/optimized/2X/4/4db4de2291312f62dad7f085d33fd6fc4c7f2130_2_690x401.png)
![image|690x248](https://aws1.discourse-cdn.com/business6/uploads/glitch/original/2X/4/42bb910d85c90fec87be2d5d537739d72a773a0d.png)

# Customization

This is very customizable as all the templates are in one directory I think. There is also a template that "wraps" on top of the other templates which includes the topbar.

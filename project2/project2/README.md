# Project 2

# Requirements
* **Display Name:**  
  * [x] When a user visits your web application for the first time, they should be prompted to type in a display name that will eventually be associated with every message the user sends. 
  * [x] If a user closes the page and returns to your app later, the display name should still be remembered.
* [x] **Channel Creation:**  Any user should be able to create a new channel, so long as its name doesn’t conflict with the name of an existing channel.
* [x] **Channel List:**  Users should be able to see a list of all current channels, and selecting one should allow the user to view the channel. We leave it to you to decide how to display such a list.
* **Messages View:**
  * [x] Once a channel is selected, the user should see any messages that have already been sent in that channel, up to a maximum of 100 messages. 
  * [x] Your app should only store the 100 most recent messages per channel in server-side memory.
* **Sending Messages**
  * [x] Once in a channel, users should be able to send text messages to others in the channel.
  * [x] When a user sends a message, their display name and the timestamp of the message should be associated with the message.
  * [x] All users in the channel should then see the new message (with display name and timestamp) appear on their channel page. 
  * [x] Sending and receiving messages should NOT require reloading the page.
* [x] **Remembering the Channel:**  If a user is on a channel page, closes the web browser window, and goes back to your web application, your application should remember what channel the user was on previously and take the user back to that channel.
* [] **Personal Touch:**  Add at least one additional feature to your chat application of your choosing! Feel free to be creative, but if you’re looking for ideas, possibilities include: supporting deleting one’s own messages, supporting use attachments (file uploads) as messages, or supporting private messaging between two users.
* [] **Readme:** In README.md, include a short writeup describing your project, what’s contained in each file, and (optionally) any other additional information the staff should know about your project. Also, include a description of your personal touch and what you chose to add to the project.
* [] **Other Packages:** If you’ve added any Python packages that need to be installed in order to run your web application, be sure to add them to requirements.txt!


# Description
A basic chat system with server and client.  Features include multiple custom channels, remembering the channel and user name last used, and caching of messages.


# Other Features
####Server commands####
 * **/roll (x)d(y)**  Rolls x number of dice with, each with y sides, and displays the results in chat.  e.g. /roll 2d4 will roll two four-sided dice.  Useful for solving minor conflicts in an unbiased fashion.
 * **/died**  During debates somebody will eventually say something that makes you lose faith in humanity.  This command lets everyone know you just died a little inside.
 * **/magic8**  A magic-8 ball.  Perfect for helping with any existential questions you have.
####Auto scrolling####
Will keep current messages at the bottom of the screen ONLY if you are already scrolled down to the bottom.  This lets you keep new messages in view, but still allows you to scroll up to previous messages without losing control of you window's position.
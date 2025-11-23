# Issues

## 1 - BE: Neon Name Conflict

Natacha creates the models, noting for "requests", named it "requestes"
JF creates a double model for request named "join_requests"

Natacha tried to erase trace of "join_requests" and keep "requestes".
Late down the line, when Natacha was working on the Django Admin page, the "requests" section wouldn't work.
Hypothesis the already names conflict can be a cause. SO had to drop all tables, cleaning Neon fresh clean.

Fixed it.

## 2 - FE: Connexion Fashing Page

Nadia worked on the FrontEnd. When connecting, the page would flicker between two pages. While it seems the site was still fucntionable on her end, when Natacha tried it, she can't log in. Making it so working not possible...

In progress to be fixed.

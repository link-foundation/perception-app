# How to make this repository pullable in your repository
```
git remote add sdk https://github.com/deep-foundation/sdk.git
git fetch sdk
git merge sdk/main --allow-unrelated-histories --strategy ours 
```
Note that we use `ours` strategy during merge to avoid any changed in your existing project

Now you can pull changes from this repository by using
```
git pull sdk main
```

## Prerequisitions
- Install and use nodejs version from .nvmrc
```
nvm install && nvm use
```
- Install dependencies
```
npm install
```
- Run by using [How to run](#how-to-run)
- Pass graphql url and token
To easily get token you can use `Copy token` button in the menu of deepcase. In the same menu you can find `gql` button where you can get graphql path


## How to run?
### Web
```
npm run build &&
npm run start
```

### Android
```
npm run android-build &&
npm run android-run
```

### IOS
```
npm run ios-build &&
npm run ios-run
```



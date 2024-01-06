# Lineage

Lineage is a prototype web app built on top of GitHub's platform to easily identify a project's technical dependencies. It's free & currently in its infancy. As it gains more end users, the plan is to double down & add in more features to make this a powerful, robust application.

## Prerequisites

- You must have a GitHub account.
- You must be owner or contributor for the repository you're looking to integrate with Lineage. If your repository is owned by an organization, you might have to contact your admin to give Lineage the proper access controls. Otherwise, the repository won't be visible.
- Your repository must have either a `lineage.yaml` custom config file or `package.json` file at the root.

## NPM support

If your project uses NPM packages, Lineage will read the contents of your `package.json` file out-of-the-box. Each dependency can be traversed by clicking on that node. Therefore, you can see all NPM dependencies for your project until there are none left to see!

When a dependency supports multiple versions, Lineage will create a "sub-tree" that shows each compatible version. This allows you to see what would be the full dependency tree based on the version you're currently targeting.

![image](https://github.com/trevalexandro/lineage-ui/assets/17580038/3b109a74-26f1-4ed7-a70f-42f2ec87c021)


## Custom configuration example
At the root of your repository, create a `lineage.yaml` file with the following content.
```
dependencies:
  - name: tailwindcss
    dependency_type: 'CSS framework'
    github_repository_link: https://github.com/tailwindlabs/tailwindcss
```
Login to https://thelineage.dev & click on the repository you've added your configuration to. You should see a dependency node in the app now. The root node is named after your repository.

![image](https://github.com/trevalexandro/lineage-ui/assets/17580038/3dbe6ea6-2b79-4553-8619-7b4eb1963841)

If the repository specified for this dependency has its own `lineage.yaml` file, we can click on the node & traverse to tailwind's dependencies.

You can also add dependencies for as many items as you'd like.

![image](https://github.com/trevalexandro/lineage-ui/assets/17580038/6ceb1731-471f-4279-a9bd-0294273054a3) 

## Fields

### `dependencies - required`

This is the root field to list all dependencies that will be shown as nodes. Technically, it's YAML's way of declaring an array. If this is missing, or if you don't nest any values underneath it, you'll get an error or undesired functionality.

### `dependencies.name - preferred`

This defines the name of the dependency & will show up as the name of the node in the app. While not having this won't cause an error, it's strongly recommended you include this value so you know what node/dependency you're looking at. Otherwise, the node will show without any name.

### `dependencies.dependency_type - preferred`

This defines the type of dependency & will show when you hover over a node in the app. This is free-form text, so you can put whatever you'd like here. Once again, while not having this won't cause an error, it's strongly recommended you include this value so you know what type of dependency you have.

### `dependencies.github_repository_link - optional`

This defines the GitHub repository link for your dependency. If a `lineage.yaml` file exists in that repository, the app will open a new window with that project's dependencies. This creates a "traversal" effect that allows you to trace transitive dependencies.

### `dependencies.health_endpoint - optional`

This defines a health check endpoint for your dependency. More than likely, this will apply to dependencies that are web APIs. By configuring this, you're able to easily know if you have a dependency that's down in real-time.

## FAQs

1. Does the `lineage.yaml` configuration allow custom fields? **No, currently, it only supports fields defined in the documentation. If this is a popular enough request in the future, this can certainly be reevaluated.**
2. Is Lineage free to use? **Yes! Lineage is free to use.**
3. Is Lineage open-source? **The front-end web app is open-source, but the backend APIs are not.**

## Known Issues

- Due to this currently being a prototype/MVP, the backend APIs are on a lower tier of cloud infrastructure support. There might be latency issues from time to time.

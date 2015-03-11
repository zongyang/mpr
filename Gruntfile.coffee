module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)
  path = require('path')
  pkg = grunt.file.readJSON("package.json")
  
  host = require('./bin/host-config')

  DEBUG = false # 添加测试所需代码，发布时应该为false

  # console.log "***************************\nhost: \n", host

  grunt.initConfig 
    host: host
    pkg: pkg
    meta:
      banner: "/**\n" + " * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today(\"yyyy-mm-dd\") %>\n" + " * <%= pkg.homepage %>\n" + " *\n" + " * Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author %>\n" + " * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n" + " */\n"

    changelog:
      options:
        dest: "CHANGELOG.md"
        template: "changelog.tpl"

    bump:
      options:
        files: ["package.json", "bower.json"]
        commit: true
        commitMessage: "chore(release): v%VERSION%"
        commitFiles: ["-a"]
        createTag: true
        tagName: "v%VERSION%"
        tagMessage: "Version %VERSION%"
        push: true
        pushTo: "origin"

    clean: 
      all:
        dot: true
        files:
          src: [
            "bin/*"
            "!bin/vendor/*" # retain bower components
            "!bin/vendor/**" # retain bower components
            "dist"
            ".temp"
          ]

    copy:
      build_app_assets:
        files: [
          src: ["**/*.*", "!**/*.{jade,ls,sass}"]
          dest: "bin/"
          cwd: "src/"
          expand: true
        ]
      server_files:
        files: [
          src: ["*.jade"]
          dest: "bin/"
          cwd: "server/"
          expand: true
        ]
      tests:
        files: [
          src: ["**/*.*", "!**/*.{jade,ls,sass}"]
          dest: "bin/tests"
          cwd: "tests/"
          expand: true
        ]

    concat:
      build_css:
        src: [
          "bin/**/*.css"
          "!bin/<%= pkg.name %>*.css"
          "!bin/vendor/**/*.css"
          "!bin/tests/**/*.css"
          "!bin/**/debug.css"
        ]
        dest: "bin/<%= pkg.name %>-<%= pkg.version %>.css"

    jade:
      options:
        pretty: false
        data: 
          pkg: pkg
          host: host
          debug: DEBUG
      index:
        expand: true
        cwd: "src"
        src: ["{index,prototype,test,try}.jade"]
        dest: "bin"
        ext: ".html"
      tests:
        expand: true
        cwd: "tests"
        src: ["*.jade"]
        dest: "bin/tests"
        ext: ".html"

    sass:
      options:
        includePaths: require('node-bourbon').with('src/common/sass')
      build:
        files: [
          src: ["**/*.sass"]
          dest: "bin/"
          cwd: "src/"
          expand: true
          ext: ".css"
        ]
      tests:
        files: [
          src: ["**/*.sass"]
          dest: "bin/tests"
          cwd: "tests/"
          expand: true
          ext: ".css"
        ]

    livescript:
      options:
        bare: false
      client:
        expand: true
        cwd: "src/"
        src: ["**/*.ls"]
        dest: "bin/"
        ext: ".js"
      index:
        options:
          bare: false
        expand: true
        cwd: "src/"
        src: ["index.ls"]
        dest: "bin/"
        ext: ".js"
      server:
        expand: true
        cwd: "server/"
        src: ["**/*.ls", "!host-config.example.ls"]
        dest: "bin/"
        ext: ".js"
      tests:
        options:
          bare: false
        expand: true
        cwd: "tests/"
        src: ["**/*.ls"]
        dest: "bin/tests"
        ext: ".js"


    # wiredep:
    #   build: 
    #     cwd: '.'
    #     src: ["bin/index.html"]
    #     devDependencies: true

    bower:
      all:
        rjsConfig: 'bin/index.js'
        options:
          exclude: []
          # baseUrl: ' bin/'
          transitive: true    

    express:
      dev:
        options:
          server: path.resolve('bin/mediate-server.js')
          bases: [path.resolve('bin')]
          livereload: host.livereload
          # serverreload: true
          port: host.port

    delta:
      options:
        livereload: false

      jade:
        files: ["src/**/*.jade", "tests/**/*.jade"]
        tasks: [
          "jade"
          "bower"
        ]

      livescriptclient:
        files: ["src/**/*.ls", "!src/index.ls"]
        tasks: ["newer:livescript:client"]

      livescriptindex:
        files: ["src/index.ls"]
        tasks: ["livescript:index", "bower"]

      livescriptserver:
        files: ["server/**/*.ls"]
        tasks: [
          "newer:livescript:server"
          "express-restart"
        ]
        options:
          livereload: false

      livescripttests:
        files: ["tests/**/*.ls"]
        tasks: ["newer:livescript:tests"]


      sass_src:
        files: ["src/**/*.sass"]
        tasks: [
          "sass:build"
          "concat:build_css"
        ]

      sass_tests:
        files: ["tests/**/*.sass"]
        tasks: [
          "sass:tests"
          # "concat:build_css"
        ]

      assets:
        files: ["src/assets/**/*"]
        tasks: [
          "newer:copy:build_app_assets"
        ]

      server_files:
        files: ["server/*.jade"]
        tasks: [
          "newer:copy:server_files"
        ]

      concat_client:
        files: ["bin/**/*.js", "!bin/vendor/**/*"]
        tasks: [
          "newer:concat"
        ]

      express:
        files: ["bin/**/*.*", "!bin/vendor/**/*", "!bin/server.js", "!bin/data.js", "!bin/public/**/*"]
        tasks: []
        options:
          livereload: host.livereload

 
  grunt.renameTask "watch", "delta"

  grunt.registerTask "watch", [
    "build"
    # "karma:unit"
    "express"
    "delta"
  ]
  grunt.registerTask "default", [
    "build"
    # "compile"
  ]
  grunt.registerTask "build", [
    "clean"
    "copy:build_app_assets"
    "copy:server_files"
    "copy:tests"
    "jade"
    "livescript"
    "sass"
    "concat"
    "bower"
  ]
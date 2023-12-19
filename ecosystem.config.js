module.exports = {
    apps: [
        {
            name: 'app1',
            script: './build/index.js',
            env_production: {
                NODE_ENV: 'production',
            },
            env_development: {
                NODE_ENV: 'development'
            }
        },
        {
            name: 'app2',
            script: './build/taskRunner.js',
            env_production: {
                NODE_ENV: 'production',
            },
            env_development: {
                NODE_ENV: 'development'
            }
        },

    ]
}
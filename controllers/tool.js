const { validationResult } = require('express-validator/check');
const Op = require('sequelize').Op;

const Tool = require('../models/tool');

exports.getTools = (request, response, next) => {
    Tool.findAll({ where: { tags: { [Op.iLike]: request.query.tag ? `%${request.query.tag}%` : ''} } })
    .then(tools => {
        for(tool of tools) {
            if(tool.tags) {
                const tags = tool.tags.split(',');
                const tagsList = [];
                for(tag of tags) {
                    tagsList.push(tag.trim());
                }
                tool.tags = tagsList;
            }
        }
        response.status(200).json(tools);
    })
    .catch(error => {
        console.log(error);
        response.status(500).json(error);
    });
}

exports.postTools = (request, response, next) => {
    const errors = validationResult(request);
    if(!errors.isEmpty()) {
        return response.status(400).json(errors);
    }
    const tagsList = request.body.tags;
    let tags = '';
    if(tagsList.length) {
        tags = tagsList.join(',');
    }
    Tool.create({
        title: request.body.title,
        link: request.body.link,
        description: request.body.description,
        tags: tags,
        userId: request.tokenPayload.userId
    })
    .then(tool => {
        if(tool.tags) {
            const tags = tool.tags.split(',');
            const tagsList = [];
            for(tag of tags) {
                tagsList.push(tag.trim());
            }
            tool.tags = tagsList;
        }
        response.status(201).json(tool);
    })
    .catch(error => {
        console.log(error);
        response.status(500).json(error);
    });
}
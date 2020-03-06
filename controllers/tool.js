const { validationResult } = require('express-validator/check');
const Op = require('sequelize').Op;

const Tool = require('../models/tool');

exports.getTools = (request, response, next) => {
    let params;
    
    if(request.query.q) {
        params = { [Op.or]: [
            { title: { [Op.iLike]: `%${request.query.q}%` } },
            { link: { [Op.iLike]: `%${request.query.q}%` } },
            { description: { [Op.iLike]: `%${request.query.q}%` } },
            { tags: { [Op.iLike]: `%${request.query.q}%` } }
        ]};
    }

    if(request.query.tags_like) {
        params = { tags: { [Op.iLike]: `%${request.query.tags_like}%` } };
    }
    
    Tool.findAll({ where: params })
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
        next(error.message);
        response.status(500).json({ statusCode: 500, message: 'INTERNAL SERVER ERROR' });
    });
}

exports.postTools = (request, response, next) => {
    const result = validationResult(request);
    if(!result.isEmpty()) {
        return response.status(400).json({ statusCode: 400, message: 'BAD REQUEST', errors: result.errors });
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
        // userId: request.tokenPayload.userId
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
        // next(error);
        response.status(500).json({ statusCode: 500, message: 'INTERNAL SERVER ERROR' });
    });
}
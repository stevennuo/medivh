'use strict';
var async = require('async');
var _ = require('lodash');

exports.traverse = function (mongoose, cb) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;
    var Publisher = mongoose.model('Publisher', new Schema({
        name: String,
        chapters: [
            {type: ObjectId}
        ]
    }, { collection: 'publishers' }));
    var Chapter = mongoose.model('Chapter', new Schema({
        name: String,
        topics: [
            {type: ObjectId}
        ]
    }));
    var Topic = mongoose.model('Topic', new Schema({
        name: String,
        tasks: [
            {type: ObjectId}
        ]
    }));
    var Task = mongoose.model('Task', new Schema({
        type: String,
        activities: [
            {type: ObjectId}
        ]
    }));
    var Activity = mongoose.model('Activity', new Schema({
        name: String,
        videos: [
            {type: ObjectId}
        ]
    }));
    var Video = mongoose.model('Video', new Schema({
        type: String,
        url: String
    }));

    var target = [];
    Publisher.findOne({name: '人民教育出版社'}, function (err, publisher) {
        Chapter.find({_id: {$in: publisher.chapters}}, function (err, chapters) {
            async.each(chapters, function (chapter, callback) {
                Topic.find({_id: {$in: chapter.topics}}, function (err, topics) {
                    async.each(topics, function (topic, callback) {
                        Task.find({_id: {$in: topic.tasks}}, function (err, tasks) {
                            async.each(tasks, function (task, callback) {
                                Activity.find({_id: {$in: task.activities}}, function (err, activities) {
                                    async.each(activities, function (activity, callback) {
                                        Video.find({_id: {$in: activity.videos}, type: 'main'}, function (err, videos) {
                                            _.forEach(videos, function (video) {
                                                target.push({chapter: chapter.name, topic: topic.name, task: task.type,
                                                    activity: activity.name, video: video.url});
                                            });
                                            callback();
                                        })
                                    }, callback);
                                });
                            }, callback);
                        });
                    }, callback);
                });
            }, function () {
                cb(target);
            });
        });
    });
}

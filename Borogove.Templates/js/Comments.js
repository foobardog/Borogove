/// <reference path="./lib/require.js" data-main="." />
/// <reference path="./lib/jquery-2.2.3.js" />
/// <reference path="./lib/o.js" />
/// <reference path="./lib/pure.js" />
document.querySelector('div#commentsNoScript').hidden = true;
requirejs.config({
    baseUrl: '../js/lib',
    paths: {
        'jquery': 'jquery-2.2.3'
    },
    shim: {
        'pure': {
            deps: ['jquery']
        }
    }
});
requirejs(['jquery', 'q', 'o', 'pure'], function (jQuery, q, o, pure) {
    var getRootUrl = function () {
        var reg = new RegExp(/^.*?\//);
        return reg.exec(window.location.href);
    }

    var getCommenterName = function (li) {
        var comment = li.item;
        return (comment && comment.WorkCreators && comment.WorkCreators[0] && comment.WorkCreators[0].WorkedAsName) || "Anonymous"
    }

    var commentsDirective = {
        'li.comment': {
            'comment<-': {
                'h3.commentTitle': function (li) {
                    return li.item.Title || ("Comment from " + getCommenterName(li));
                },
                'div.commenterName': getCommenterName,
                'div.commentCreatedDate': 'comment.CreatedDate',
                'div.commentModifiedDate': 'comment.ModifiedDate',
                'div.commentModifiedDate': 'comment.Content',
                'div.commentReplies': function (li) {
                    return (li.item.Comments && li.item.Comments.length > 0) ? commentsCompiledFunction(li.item.Comments) : '';
                }
            }
        }
    };

    var commentsCompiledFunction = $('ul.commentList').compile(commentsDirective);

    var workIdentifier = document.querySelector('input#workIdentifier').getAttribute('value');

    var renderComments = function (data) {
        $('div#commentsSpinner').attr('hidden', true);
        if (data && data.length > 0) {
            $('ul.commentList').render(data, commentsCompiledFunction);
        }
        else {
            $('ul.commentList').attr('hidden', true);
            $('div#commentsNoComments').attr('hidden', false);
        }
    };

    if (workIdentifier != null) {
        o(getRootUrl() + "api/Works(" + workIdentifier + ")/Comments")
            .orderBy('CreatedDate')
            .expand('WorkCreators($top=1;$select=WorkedAsName),Comments($levels=max;$select=Title,CreatedDate,ModifiedDate,Content;$orderby=CreatedDate;$expand=WorkCreators($top=1;$select=WorkedAsName))')
            .get(renderComments);
        $('div#commentsSpinner').attr('hidden', false);
    }
});

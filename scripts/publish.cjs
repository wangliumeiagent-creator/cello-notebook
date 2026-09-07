// Publish an already committed build without requiring GitHub workflow scope.
const {execFileSync}=require('node:child_process');
const path=require('node:path');process.chdir(path.resolve(__dirname,'..'));
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
if(git('branch','--show-current')!=='main')throw Error('请在 main 分支发布。');
if(git('status','--porcelain','--untracked-files=no'))throw Error('请先构建并提交所有修改，再发布。');
execFileSync(process.execPath,['--test','tests/core.test.cjs','tests/laputa.test.cjs'],{stdio:'inherit'});
const parent=[];
if(git('ls-remote','--heads','origin','gh-pages')){
 execFileSync('git',['fetch','origin','refs/heads/gh-pages:refs/remotes/origin/gh-pages'],{stdio:'inherit'});
 parent.push('-p',git('rev-parse','refs/remotes/origin/gh-pages'));
}
const [name,email]=git('show','-s','--format=%an%n%ae','HEAD').split('\n');
const site=execFileSync('git',['commit-tree',git('rev-parse','HEAD:dist'),...parent,'-m','Publish '+git('rev-parse','--short','HEAD')],{
 encoding:'utf8',env:{...process.env,GIT_AUTHOR_NAME:name,GIT_AUTHOR_EMAIL:email,GIT_COMMITTER_NAME:name,GIT_COMMITTER_EMAIL:email}
}).trim();
execFileSync('git',['push','origin','main'],{stdio:'inherit'});
execFileSync('git',['push','origin',site+':refs/heads/gh-pages'],{stdio:'inherit'});
console.log('已推送源码与网页，GitHub Pages 将自动部署 gh-pages 分支。');

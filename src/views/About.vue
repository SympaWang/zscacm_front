<template>
  <div class="about-page">
    <div class="page-card">
      <h2 class="page-title">ACM-ICPC</h2>
      <div class="article" v-html="acmIntro"></div>
    </div>
    <div class="page-card">
      <h2 class="page-title">集训队历史</h2>
      <div class="article">
        <p>
          我校自2007年开始筹建ACM-ICPC校队，并于2008年第一次走出校门外出参赛。至今，ACM集训队学生已经在各类程序设计大赛中获得省级以上奖项超过500项。
          自2015年首次获得ACM国际大学生程序设计竞赛亚洲区域赛铜奖以来，至今共获得亚洲区域赛银奖4项、铜奖11项。（数据更新至2022年6月）
        </p>
        <p>
          参加ACM-ICPC的同学毕业后有些去到了腾讯、阿里、字节跳动、百度、网易、滴滴、小米、蔚来、美图、乐信、金山等知名公司。近两年，ACM队员毕业年薪普遍在15-20万之间。优秀的同学毕业年薪达到40万。
        </p>
        <div class="history-imgs">
          <el-image :src="history1" fit="cover" class="history-img" />
          <el-image :src="history2" fit="cover" class="history-img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const history1 = '/static/history1.jpg'
const history2 = '/static/history2.png'
const acmIntro = `
<p>
  ACM-ICPC即ACM国际大学生程序设计竞赛是由国际计算机学会主办的一项旨在展示大学生创新能力、团队精神和在压力下编写程序、分析和解决问题的年度竞赛。
  比赛采用现场对抗的方式进行，在长达5个小时的现场封闭式比赛过程中，选手必须完全依赖自身的能力去解决问题，并通过机器的自动评测，其成绩的真实性不容置疑。其公正和公平是大家所赞赏的。
</p>
<p>
  自1976年以来，经过40多年的发展，ACM-ICPC已经发展成为最具影响力的大学生计算机竞赛，被冠以"计算机界的奥林匹克竞赛"的尊称。
  因历届竞赛都荟萃了世界各大洲的精英，云集了计算机界的"希望之星"，而受到国际各知名大学的重视，并受到全世界各著名计算机公司如Microsoft(微软公司)、IBM等的高度关注，成为世界各国大学生最具影响力的国际级计算机类的赛事。
  ACM-ICPC所颁发的获奖证书也为世界各著名计算机公司、知名大学所认可。随着ACM-ICPC活动的深入开展，亚洲尤其是中国内地高校都十分重视该项赛事，纷纷踊跃参加。在过去40多年中，APPLE、AT&amp;T、MICROSOFT、IBM和GOOGLE等分别担任了竞赛的赞助商。
</p>
<p class="acm-slogan"><strong>A：Ability、C：Confidence、M：Miracle，提高能力、增强信心就能创造属于自己的奇迹。</strong></p>`
</script>

<style scoped>
.article { line-height: 2; font-size: 15px; color: var(--text-secondary); }
.article :deep(p) { margin: 0 0 14px; text-indent: 2em; }
.acm-slogan { color: #c0504d; text-align: center; }
.history-imgs { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 12px; }
.history-img { width: 320px; border-radius: 10px; box-shadow: var(--shadow); }
</style>

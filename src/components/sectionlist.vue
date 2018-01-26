<template>
    <div :style="{height:winHeight +'px',minWidth:'630px'}" class="booklist" id="sectionList" ref="sectionList" @contextmenu.prevent="openContextMenu($event)" @click="conMenuShow = false;" @mousemove="removeBrowersEvent($event)">
        <el-row :gutter="0" type="flex" justify="center">
            <el-col :xs="1" :sm="1" :md="1" :lg="1" class="book-section">
            </el-col>
            <el-col :xs="22" :sm="22" :md="22" :lg="22" class="book-section">
                <div class="book-content">
                
                    <div class="book-cont-head" v-if="!isHotRegion">  
                        <!-- <el-button type="primary" @click="toBooklist">图书列表</el-button> -->
                         <el-radio-group v-model="radio99" >
                            <el-radio-button label="图书列表" v-show="!isRegion"></el-radio-button>
                            <el-radio-button label="章节列表" v-show="!isRegion"></el-radio-button>
                         </el-radio-group>
                        
                        <!-- 根据是否是涉及地区来渲染页面 -->
<!--                         <el-radio-group v-model="radio99" v-else>
                            <el-radio-button label="章节列表" style="border-radius:4px"></el-radio-button>
                        </el-radio-group> -->
                        <span>
                         <el-button @click="openFilterMenu">筛选</el-button>
                           <span style="position:relative">
                             <el-input
                                placeholder="请输入章节名或关键字"
                                icon="search"
                                v-show="!isRegion"
                                v-model="input"
                                :on-icon-click="handleIconClick"
                                @keyup.enter.native="handleIconClick"
                                >
                              </el-input >
                              <i class="el-icon-close close-search"  v-show="!isRegion"  @click="resetSearchKey"></i>
                          </span>
                       </span>
                    </div>

                    <div class="book-cont-head" style="height:30px" v-else>
                        
                    </div>


                    <p style="margin-bottom:10px" v-show="isShowSearchResult">
                        与“<span class="search-text-color">{{showSearchKeyword}}</span>”相关检索结果：共<span class="search-text-color">{{totalData}}</span>条
                    </p>


                    <div class="has-selected all-selected" style="margin:0 0 8px 0">
                        <!-- 已选人物 -->
                        <span v-show="checkboxGroup1.length !== 0">
                            人物：<el-tag  :key="tag.Id" v-for="tag in checkboxGroup1" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleCloseInList(tag,checkboxGroup1)" >
                               {{tag.Title}}
                           </el-tag>
                        </span>
                        
                        <!-- 已选地名 -->
                        <span v-show="checkboxGroup2.length !== 0">
                            地名：<el-tag  :key="tag.Id" v-for="tag in checkboxGroup2" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleCloseInList(tag,checkboxGroup2)">
                            {{tag.Title}}
                           </el-tag>
                        </span>

                        <!-- 已选方位 -->
                        <span v-show="positionGroup.length !== 0">
                            方位：<el-tag  :key="tag.id" v-for="tag in positionGroup" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleCloseInList(tag,positionGroup)">
                            {{tag.title}}
                           </el-tag>
                        </span>

                        <!-- 已选分类 -->
                        <span v-show="classGroup.length !== 0">
                            分类：<el-tag  :key="tag.id" v-for="tag in classGroup" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleCloseInList(tag,classGroup)">
                            {{tag.title}}
                           </el-tag>
                        </span>

                        <!-- 已选政权 -->
                        <span v-show="dynastyGroup.length !== 0">
                             政权：<el-tag  :key="tag.id" v-for="tag in dynastyGroup" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleCloseInList(tag,dynastyGroup)">
                            {{tag.title}}
                           </el-tag>
                        </span>

                        <!-- 已输入时间 -->
                        <span v-show="allSearchOption[allSearchOption.length - 1].indexOf('公元') != -1">
                        时间段：<el-tag 
                                  :closable="true" 
                                  :close-transition="true" 
                                  color="#afd0fe" 
                                  :hit="true" 
                                  :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" 
                                  @close="handleCloseTimeStampInList()"
                                >

                                    {{allSearchOption[allSearchOption.length - 1]}}
                                </el-tag>
                        </span>
                    </div>


                     <el-table
                        ref="sectionListTable"
                        :data="bookListData"
                        style="width: 100%"
                        :highlight-current-row="true"
                        :row-key="getRowKeys"
                        :expand-row-keys="expands"
                        v-if="bookListData.length !== 0">
                        <el-table-column type="expand" class-name="expand-bg">
                          <template scope="props">
                              <div  >
                                  <div  @contextmenu.stop="openContextMenu($event,-1)" style="line-height:20px">
                                   {{props.row.Description?'摘要：'+delTitleAndAbs(2,props.row.Description):'摘要：暂无简介'}}
                                  </div>
                                 <div class="mysource" style="margin-top:10px" @contextmenu.stop="openContextMenu($event,-1)" @click="goBookDetail(props.row.ParentId,props.row.Source)">来源：{{'《'+props.row.Source+'》'}}</div>
                              </div>
                          </template>
                        </el-table-column>
                        <el-table-column
                          label="章 名"
                          >
                          <template scope="props">
                              <a href="javascript:void(0)" @click="beforeToBookView(props.row);">{{delTitleAndAbs(1,props.row.Title)}}</a>
                          </template>
                        </el-table-column>
                        <el-table-column
                          label="详 情"
                          align="center"
                          >
                          <template scope="props">
                              <a href="javascript:void(0)" style="cursor:pointer" @click="expandRowKeys(props.row.Id,props.row)">
                                 <i class="el-icon-arrow-down" :style="{transition:'all .5s',transform:'rotate('+transform(props.row)+'deg)'}">
                                 </i> &nbsp;{{props.row.isExpand?'收起':'展开'}}
                              </a>
                          </template>
                        </el-table-column>
                        <el-table-column
                          label="状 态"
                          align="center"
                          >
                          <template scope="props">
                            <el-button size="small" 
                            :data-bookData="JSON.stringify(props.row)" 
                            :type="props.row.hasDown?'primary':''" 
                            style="padding: 8px 15px;width:80px" 
                            :disabled="props.row.startDownLoad && props.row.downLoadPercent !== 100 ?true:false" 
                            @click.stop="download($event,props.row.Id,props.row,props.$index)">{{props.row.hasDown?'阅 读': (props.row.downLoadPercent== 0 && !props.row.startDownLoad? '点击下载': props.row.downLoadPercent + '%')}}</el-button>
                          </template>
                        </el-table-column>
                      </el-table>

                      <p v-else class="noTableData">暂无相关章节信息</p>
                    
                    <!-- 只要列表内容为空或是热区或是相关文章，分页都隐藏 -->
                    <div class="block" v-show="bookListData.length !== 0 && !isRegion && !isHotRegion">
                         <el-pagination
                          @size-change="handleSizeChange"
                          @current-change="handleCurrentChange"
                          :current-page="currentPage"
                          :page-sizes="[15, 20, 30, 40]"
                          :page-size="pageSize"
                          layout="total, sizes, prev, pager, next, jumper"
                          :total="totalData">
                        </el-pagination>
                    </div>
                </div>
            </el-col>
            <el-col :xs="1" :sm="1" :md="1" :lg="1" class="book-section">
            </el-col>
        </el-row>
        <el-dialog title="筛选" :visible.sync="dialogVisible" :size="dialog?'small':'large'" top="5%" :show-close="false">
            <div>
                <div class="person-search">
                    <div id="person-left" class="person-left">
                        <span>人物：</span>
                    </div>
                    <div class="person-right">
                        <div class="eng-first-word">
                            <ul>
                            <!-- ,width: winWidth/52+'px',height:winHeight/35 +'px' -->
                                <li v-for="(item,index) in engFirstWord1" :style="{outline:item.selected?'1px solid #5980b8':'',background:item.selected?'#F39800':'',color:item.selected?'white':'black'}" @click="handleSelectEngWorld(index,engFirstWord1,1)">{{item.word}}</li>
                            </ul>
                            <div style="margin-top:10px"></div>
                            <el-checkbox-group v-model="checkboxGroup1" size="small" fill="#afd0fe" text-color="#000">
                                <el-checkbox-button style="margin:0 5px 5px" v-for="person in persons" :label="person" :key="person.Id">{{person.Title}}</el-checkbox-button>
                            </el-checkbox-group>
<!--                             <div class="has-selected">
                                <p>&nbsp;已选择：
                                <el-tag :key="tag.Id" v-for="tag in checkboxGroup1" :closable="true" :close-transition="true" color="#5980b8" :hit="true" style="margin:0 5px 5px 0" @close="handleClose(tag,checkboxGroup1)">
                                    {{tag.Title}}
                                </el-tag>
                                </p>
                            </div> -->
                        </div>
                    </div>
                </div>

                <div class="hr"></div>

                <div class="person-search">
                    <div id="address-left" class="person-left">
                        <span>地名：</span>
                    </div>
                    <div class="person-right">
                        <div class="eng-first-word">
                            <ul>
                                <li v-for="(item,index) in engFirstWord2" :style="{outline:item.selected?'1px solid #5980b8':'',background:item.selected?'#F39800':'',color:item.selected?'white':'black'}" @click="handleSelectEngWorld(index,engFirstWord2,3)">{{item.word}}</li>
                            </ul>
                            <div style="margin-top:10px"></div>
                            <el-checkbox-group v-model="checkboxGroup2" size="small" fill="#afd0fe" text-color="#000">
                                <el-checkbox-button style="margin:0 5px 5px" v-for="address in addresses" :label="address" :key="address.Id">{{address.Title}}</el-checkbox-button>
                            </el-checkbox-group>
<!--                             <div class="has-selected">
                                <p>&nbsp;已选择：
                                <el-tag :key="tag.Id" v-for="tag in checkboxGroup2" :closable="true" :close-transition="true" color="#5980b8" :hit="true" style="margin:0 5px 5px 0" @close="handleClose(tag,checkboxGroup2)">
                                    {{tag.Title}}
                                </el-tag>
                                </p>
                            </div> -->
                        </div>
                    </div>
                </div>
                <div class="hr"></div>
                <div class="person-search other-group" >
                    <div id="pos-left" class="person-left ">
                        <span>方位：</span>
                    </div>
                    <div class="person-right">
                        <div class="eng-first-word">
                            <div style="margin-top:10px"></div>
                            <el-checkbox-group v-model="positionGroup" size="small" fill="#afd0fe" text-color="#000">
                                <el-checkbox-button style="margin:0 5px 5px" v-for="pos in position" :label="pos" :key="pos.id">{{pos.title}}</el-checkbox-button>
                            </el-checkbox-group>
                        </div>
                    </div>
                </div>
                <div class="hr"></div>

                <div class="person-search other-group" >
                    <div id="class-left" class="person-left ">
                        <span>分类属性：</span>
                    </div>
                    <div class="person-right">
                        <div class="eng-first-word">
                            <div style="margin-top:10px"></div>
                            <el-checkbox-group v-model="classGroup" size="small" fill="#afd0fe" text-color="#000">
                                <el-checkbox-button style="margin:0 5px 5px" v-for="cla in classes" :label="cla" :key="cla.id">{{cla.title}}</el-checkbox-button>
                            </el-checkbox-group>
                        </div>
                    </div>
                </div>

                <div class="hr"></div>

                <div class="person-search" >
                    <div id="dynasty-left" class="person-left">
                        <span>政权清单：</span>
                    </div>
                    <div class="person-right">
                        <div class="eng-first-word dynasty-word">
                            <ul>
                                <li v-for="(item,index) in engFirstWord3" :style="{outline:item.selected?'1px solid #5980b8':'',background:item.selected?'#F39800':'',color:item.selected?'white':'black'}" @click="handleSelectEngWorld(index,engFirstWord3,4)">{{item.title}}</li>
                            </ul>
                            <div style="margin-top:10px"></div>
                            <el-checkbox-group v-model="dynastyGroup"  size="small" fill="#afd0fe" text-color="#000">
                                <el-checkbox-button style="margin:0 5px 5px" v-for="dynasty in dynasties" :label="dynasty" :disabled="input1 !=='' || input2 !==''" :key="dynasty.id">{{dynasty.title}}</el-checkbox-button>

                            </el-checkbox-group>

                            <!-- <div class="dynasty-date">
                                &nbsp;时间段：
                                <select v-model="select1" :disabled="dynastyGroup.length==0?false:true" @change="dateResolve">
                                    <option value="公元前">公元前</option>
                                    <option value="公元">公元</option>
                                </select>
                                <input type="number" v-model="input1" :disabled="dynastyGroup.length==0?false:true" @blur="dateResolve">
                                <select v-model="select2" :disabled="dynastyGroup.length==0?false:true" @change="dateResolve">
                                    <option value="公元前">公元前</option>
                                    <option value="公元">公元</option>
                                </select>
                                <input type="number" v-model="input2" :disabled="dynastyGroup.length==0?false:true" @blur="dateResolve">
                                <span :style="{color:'#5980b8',paddingTop:dialog?'10px':''}">
                                注意：朝代与时间段只能用其中一种方式，且时间段只能输入数字，如公元前200 ~ 公元300</span>
                            </div> -->
                        </div>
                    </div>
                </div>
                <div class="hr"></div>

                <div class="person-search other-group" >
                    <div id="class-left" class="person-left " style="margin-top:-30px">
                        <span>时间段：</span>
                    </div>
                    <div class="person-right">
                        <div class="eng-first-word">
                            <div style="margin-top:10px"></div>
                            <div class="eng-first-word dynasty-word">
                                <div class="dynasty-date">
                                    <select v-model="select1" :disabled="dynastyGroup.length==0?false:true" @change="dateResolve">
                                        <option value="公元前">公元前</option>
                                        <option value="公元">公元</option>
                                    </select>
                                    <input type="number" v-model="input1" :disabled="dynastyGroup.length==0?false:true" @blur="dateResolve">
                                    <select v-model="select2" :disabled="dynastyGroup.length==0?false:true" @change="dateResolve">
                                        <option value="公元前">公元前</option>
                                        <option value="公元">公元</option>
                                    </select>
                                    <input type="number" v-model="input2" :disabled="dynastyGroup.length==0?false:true" @blur="dateResolve">
                                    <span :style="{color:'#5980b8',paddingTop:'10px'}">
                                    注意：朝代与时间段只能用其中一种方式，且时间段只能输入数字，如公元前200 ~ 公元300</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="hr"></div>


                <div class="has-selected all-selected">
                    <!-- 展示全部 -->
                    <!-- <el-tag :key="tag" v-for="tag in allSearchOption" :closable="true" :close-transition="true" color="#fff" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid black'}" @close="allHandleClose(tag,allSearchOption)">
                        {{tag}}
                    </el-tag> -->
                   
                    <!-- 已选人物 -->
                    人物：<el-tag :key="tag.Id" v-for="tag in checkboxGroup1" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleClose(tag,checkboxGroup1)" >
                        {{tag.Title}}
                    </el-tag>
                    
                    <!-- 已选地名 -->
                    地名：<el-tag :key="tag.Id" v-for="tag in checkboxGroup2" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleClose(tag,checkboxGroup2)">
                        {{tag.Title}}
                    </el-tag>

                    <!-- 已选方位 -->
                    方位：<el-tag :key="tag.id" v-for="tag in positionGroup" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleClose(tag,positionGroup)">
                        {{tag.title}}
                    </el-tag>
                    <!-- 已选分类 -->
                    分类：<el-tag :key="tag.id" v-for="tag in classGroup" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleClose(tag,classGroup)">
                        {{tag.title}}
                    </el-tag>
                    <!-- 已选政权 -->
                    政权：<el-tag :key="tag.id" v-for="tag in dynastyGroup" :closable="true" :close-transition="true" color="#afd0fe" :hit="true" :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" @close="handleClose(tag,dynastyGroup)">
                        {{tag.title}}
                    </el-tag>

                    <!-- 已输入时间 -->
                    时间段：<el-tag 
                              :closable="true" 
                              :close-transition="true" 
                              color="#afd0fe" 
                              :hit="true" 
                              :style="{margin:'0 10px 5px 0',maxWidth:winWidth/2+'px',color:'#444',border:'1px solid #2b579a'}" 
                              v-show="allSearchOption[allSearchOption.length - 1].indexOf('公元') != -1"
                              @close="handleCloseTimeStamp()">

                                {{allSearchOption[allSearchOption.length - 1]}}
                            </el-tag>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="searchFromFilter(pageSize)" >确 定</el-button>
      </span>
     </el-dialog>


     <div class="loading-content" v-show="loading">
            <img src="../assets/loading.gif" alt="">
        </div>


         <ul class="context-menu" :style="{left:conMenuLeft+'px',top:conMenuTop + 'px'}" v-show="conMenuShow">
            <li :class="menuListDisable.read?'':'menu-disabled'" @click="closeMenuAndDo($event,'read')">阅读该章</li>
            <li :class="menuListDisable.readAll?'':'menu-disabled'" @click="closeMenuAndDo($event,'readAll')">阅读选中</li>
            <li :class="menuListDisable.download?'':'menu-disabled'" @click="closeMenuAndDo($event,'download')">下载该章</li>
        </ul>
    </div>
</template>
<script>
export default {
    data() {
            return {
                getRowKeys(row) {
                    return row.Id;
                },
                // 要展开的行，数值的元素是row的key值
                aimNode:null,
                expands: [],
                loading:true,
                dialog:true,
                radio99:'章节列表',
                isRegion:false,
                isHotRegion:false,
                winWidth: window.innerWidth,
                winHeight: window.innerHeight,
                conMenuLeft:100,
                conMenuTop:100,
                conMenuShow:false,
                menuListDisable:{
                 read:false,
                 download:false,
                 readAll:false,
                },
                currentPage: 1,
                totalData: 0,
                pageSize:15,
                activeNames: ['1'],
                
                hasGetFilterData:false,
                allResponseData:{
                    persons:[],
                    addresses:[],
                    position:[],
                    classes:[],
                    regimePower:[]
                },
                
                //每次打开筛选框，存储上次选择的数据
                preAllSelectData :{
                   checkboxGroup1:[],
                   checkboxGroup2:[],
                   positionGroup:[],
                   classGroup:[],
                   dynastyGroup:[],
                   duration:'',
                   durationStr:''
                },




                persons: [],
                checkboxGroup1: [],

                addresses: [],
                checkboxGroup2: [],

                position: [],
                positionGroup: [],

                classes: [],
                classGroup: [],

                dynasties: [],
                dynastyGroup: [],

                noRegimeids:[],  //用于保存中华民国和中华人民共和国id
                regimeGroup:[],  //用于保存中华民国和中华人民共和国id

                select1: '公元前',
                input1: '',
                select2: '公元',
                input2: '',
                duration:'',


                allSearchOption: ['人物：', '地点：', '方位：', '分类属性：', '政权：', '时间段：'],
                input: '',
                showSearchKeyword:'',
                isShowSearchResult:false,
                bookListData: [],
                dialogVisible: false,
                engFirstWord1: [{
                    word: 'A',
                    selected: true
                }, {
                    word: 'B',
                    selected: false
                }, {
                    word: 'C',
                    selected: false
                }, {
                    word: 'D',
                    selected: false
                }, {
                    word: 'E',
                    selected: false
                }, {
                    word: 'F',
                    selected: false
                }, {
                    word: 'G',
                    selected: false
                }, {
                    word: 'H',
                    selected: false
                }, {
                    word: 'I',
                    selected: false
                }, {
                    word: 'J',
                    selected: false
                }, {
                    word: 'K',
                    selected: false
                }, {
                    word: 'L',
                    selected: false
                }, {
                    word: 'M',
                    selected: false
                }, {
                    word: 'N',
                    selected: false
                }, {
                    word: 'O',
                    selected: false
                }, {
                    word: 'P',
                    selected: false
                }, {
                    word: 'Q',
                    selected: false
                }, {
                    word: 'R',
                    selected: false
                }, {
                    word: 'S',
                    selected: false
                }, {
                    word: 'T',
                    selected: false
                }, {
                    word: 'U',
                    selected: false
                }, {
                    word: 'V',
                    selected: false
                }, {
                    word: 'W',
                    selected: false
                }, {
                    word: 'X',
                    selected: false
                }, {
                    word: 'Y',
                    selected: false
                }, {
                    word: 'Z',
                    selected: false
                }],


                engFirstWord2: [{
                    word: 'A',
                    selected: true
                }, {
                    word: 'B',
                    selected: false
                }, {
                    word: 'C',
                    selected: false
                }, {
                    word: 'D',
                    selected: false
                }, {
                    word: 'E',
                    selected: false
                }, {
                    word: 'F',
                    selected: false
                }, {
                    word: 'G',
                    selected: false
                }, {
                    word: 'H',
                    selected: false
                }, {
                    word: 'I',
                    selected: false
                }, {
                    word: 'J',
                    selected: false
                }, {
                    word: 'K',
                    selected: false
                }, {
                    word: 'L',
                    selected: false
                }, {
                    word: 'M',
                    selected: false
                }, {
                    word: 'N',
                    selected: false
                }, {
                    word: 'O',
                    selected: false
                }, {
                    word: 'P',
                    selected: false
                }, {
                    word: 'Q',
                    selected: false
                }, {
                    word: 'R',
                    selected: false
                }, {
                    word: 'S',
                    selected: false
                }, {
                    word: 'T',
                    selected: false
                }, {
                    word: 'U',
                    selected: false
                }, {
                    word: 'V',
                    selected: false
                }, {
                    word: 'W',
                    selected: false
                }, {
                    word: 'X',
                    selected: false
                }, {
                    word: 'Y',
                    selected: false
                }, {
                    word: 'Z',
                    selected: false
                }],


                engFirstWord3: []
            }
        },

        methods: {
            a(e) {
                e.stopPropagation()
            },

            //处理文章标题 及 摘要
            //@params type  Number 1-标题  2-摘要
            //@params content String 内容
            //return content String
            delTitleAndAbs(type,content) {
               if(content.indexOf(' ') !== -1 && content.indexOf(' ') <= 10){
                     //第二编 中国边徼之山川形势
                    content = content.slice(content.indexOf(' ')+1);
                 }else {
                  
                     var rules = [
                         /附录[\S\s]+《/,   //附录二《元史·释老传》藏汉译名证补
                         /附录[一二三四五六七八九十]+：/,  //附录二：靺鞨诸部的地域分布
                         /[一二三四五六七八九十]+、/, //十三、外蒙古独立(1939—1946年)
                         /第[一二三四五六七八九十]+章《/  //第一章《三国史记·高句丽本纪》所载高句丽
                       ];

                     for(var i = 0 ; i < rules.length ; i ++) {
                        if(content.match(rules[i]) && content.match(rules[i]).length !== 0) {
                           // 判断是否保留 《
                           content = content.replace(rules[i],'');

                           if(i == 0 || i == 3)  content = '《'+content;

                           break;
                        }
                     }    
                     
                 }

               //根据摘要和标题不同额外添加的规则  
               if(type == 1) {
                  

                 
               }else if(type == 2) {

               }

               return content;
            },
            transform(row) {
               return row.isExpand?180:0;
            },
            //设置展开项
            expandRowKeys(newVal,row) {
                var index = 0;
                this.bookListData.forEach((item,index1)=>{
                    if(item.Id == newVal) {
                       index = index1;
                    }
                })

                if(this.expands.indexOf(newVal) != -1) {
                   row.isExpand = false;
                   this.expands.splice(this.expands.indexOf(newVal),1);
                   this.$set(this.bookListData,index,row);
                   return;
                }

                row.isExpand = true;
                this.$set(this.bookListData,index,row);
                this.expands.push(newVal);
              },

            goBookDetail(id,title){  //链接到图书洗详情
                if(env == 'dev') {
                   this.$router.push({path:"/bookDetail",query:{bookId:id}})
                }else if(env == 'prod') {
                   SaveArgument('bookId='+id);
                   loadForm('/index.html#/bookDetail','详情',title,true)
                }
              },
            //移除浏览器默认事件
            removeBrowersEvent(e){
               if(e.target.nodeName == 'INPUT') {
                   return ;
               }
               e.preventDefault();
            },
            //获取列表数据
            getTableData(keyword = '', ps = 15, cp = 1) {
                this.loading = true;
                var preData = {
                         ps: ps, //每页条数
                         cp: cp, //当前页
                         type: 2
                    };
                var filterStr = '';
                var aimStr = '';
                //根据
                if(env == 'prod') {
                   filterStr = GetArgument();

                   if( filterStr.indexOf('relatedregionids') !== -1 ) {
                      this.isRegion = true;
                      this.isHotRegion = true;
                   }else if( filterStr.indexOf('duration') !== -1 ) {
                      this.isRegion = true;
                      this.isHotRegion = false;
                   }else {
                      this.isRegion = false;
                      this.isHotRegion = false;
                   }

                }else {
                   filterStr = location.href ;
                }
                
                if(keyword !== '') {
                   preData = Object.assign(preData,{keyword:keyword});
                }
                // else if(filterStr == '' || filterStr.indexOf('?') == -1) {
                else if(filterStr == '') {
                  preData = Object.assign(preData,{keyword:''});

                }else if(filterStr.indexOf('relatedpersonids') !== -1) {
                  //筛选的是涉及人物
                  aimStr = filterStr.substr(filterStr.indexOf('=')+1);
                  preData = Object.assign(preData,{relatedpersonids:aimStr});

                }else if(filterStr.indexOf('relatedregionids') !== -1) {
                  //筛选的是涉及地区
                  aimStr = filterStr.substr(filterStr.indexOf('=')+1);
                  // this.isRegion = true;
                  // this.isHotRegion = true;
                  preData = Object.assign(preData,{relatedregionids:aimStr});

                }else if(filterStr.indexOf('duration') !== -1) {
                  //筛选的是时间段
                  aimStr = filterStr.substr(filterStr.indexOf('=')+1);
                  // this.isRegion = true;
                  // this.isHotRegion = false;
                  var delStr = [];
                  delStr = aimStr.split('-');
                  var fBC = delStr[0].substr(delStr[0].indexOf('_')+1,1);
                  var lBC = delStr[1].substr(delStr[1].indexOf('_')+1,1);
                  var fyear = delStr[0].slice(0,4);
                  var lyear = delStr[1].slice(0,4);

                  this.input1 = fyear;
                  this.select1 = fBC == '1' ? '公元前':'公元';
                  this.input2 = lyear;
                  this.select2 = lBC == '1' ? '公元前':'公元';

                  this.dateResolve();
                  preData = Object.assign(preData,{duration:this.duration});
                }

                this.doFilter(preData)
            },
           //右键操作,打开menu
          openContextMenu(e,type) {
               e.preventDefault();
               if(type == -1) return ;
           
               this.conMenuLeft = e.pageX;
               this.conMenuTop = e.pageY;
               this.conMenuShow = true;
               this.aimNode = null;

               // 先将所有按钮止于不可用
               
                this.menuListDisable = {
                     read:false,
                     download:false,
                     readAll:false,
                   }

               //判断阅读按钮能否使用
               if(e.target.nodeName == 'TD') {
                //都点击的td
                  this.aimNode = e.target.parentNode.children[3];
               }else if(e.target.nodeName == 'A') {
                  // 点击的是第一个单元格里的文字a标签
                  this.aimNode = e.target.parentNode.parentNode.parentNode.children[3];
               }else if(e.target.nodeName == 'DIV') {
                  //点击的是a标签的 父容器div
                  this.aimNode = e.target.parentNode.parentNode.children[3];
               }else if(e.target.nodeName == 'I') {
                  // 点击的是a 的子元素i
                  this.aimNode = e.target.parentNode.parentNode.parentNode.parentNode.children[3];
               }else if(e.target.nodeName == 'I') {
                  // 点击的是a 的子元素i
                  this.aimNode = e.target.parentNode.parentNode.parentNode.parentNode.children[3];
               }else if(e.target.nodeName == 'BUTTON') {
                  // 点击的是button
                  this.aimNode = e.target.parentNode.parentNode;
               }else if(e.target.nodeName == 'SPAN') {
                  // 点击的是button
                  this.aimNode = e.target.parentNode.parentNode.parentNode;
               }

              if(this.aimNode) {
                 if(this.aimNode.innerText.trim() == '点击下载') {
                   this.menuListDisable.download = true;
                 }else if(this.aimNode.innerText.trim()== '阅 读') {
                     this.menuListDisable.read = true ;
                     this.menuListDisable.readAll = true ;
                 } 
              }

          }, 

           //设置阅读多条
           readAll(e) {
             if(!this.getAllSelected()) {
                this.$message.error('含有未下载的章节，请下载后阅读');
             }else {
                //多条id发往后台
             }
           },
           //获取页面被选中的条数
           getAllSelected() {
               var selList = [];
               var selIds = [];
               var fileNodes = document.getElementsByClassName('el-collapse-item');
               for ( var i = 0; i < fileNodes.length; i++) { 
                  if (fileNodes[i].className.indexOf("seled") != -1) { 
                    selList.push(fileNodes[i]); 
                  } 
                } 

                for ( var i = 0; i < selList.length; i++) { 
                   if( selList[i].children[0].children[2].innerText == '点击下载') {
                      return false; 
                   }else if(selList[i].children[0].children[2].innerText == '阅 读') {
                      selIds.push(selList[i].getAttribute('data-id'));
                   }
                }

                return  selIds;
           },
            //点击右键菜单中的选项的操作
          closeMenuAndDo(e,operate) {
              if(e.target.className !== '') return;
              var bookData = null;
              if(this.aimNode.children[0].children[0].nodeName == 'BUTTON') {
                 bookData = this.aimNode.children[0].children[0].getAttribute('data-bookData');
              }
              switch (operate) {
                //阅读该章
                case 'read':
                     if(bookData) {
                         bookData = JSON.parse(bookData)
                         this.toBookView(bookData.Id,bookData);
                     } 
                  break;
                case 'download':
                //下载该章
                     if(bookData) {
                         var index = 0;
                         bookData = JSON.parse(bookData)
                         this.bookListData.forEach((item,index1)=>{
                            if(item.Id == bookData.Id) index = index1;
                         })

                         this.download(e,bookData.Id,bookData,index);
                     }
                  break;
                case 'readAll':
                //阅读选中
                     if(bookData) {
                         bookData = JSON.parse(bookData)
                         this.toBookView(bookData.Id,bookData);
                     } 
                  break;        
                default:
                  // statements_def
                  break;
              }
          },
          //点击章节名称进行的跳转
          beforeToBookView(row) {
             if(!row.hasDown) {
                this.$message({
                  message: '请先下载该章节！',
                  type: 'warning'
                });
             }else {
                this.toBookView(row.Id,row);
             }
          },
          //团转图书阅读界面
         toBookView(sectionid,item) {
          // console.log(item)
            if(env == 'dev') {
               location.href  = './static/reader.html?sectionid='+sectionid;
            }else if(env == 'prod') {
               SaveArgument('sectionId='+sectionid+'&secret='+item.Secret+'&bookSrc='+item.nativeUrl+'&parentId='+item.ParentId)
               loadForm('/static/reader.html','图书阅读',item.Title,true);
            }
         },  
            // 分页
            handleSizeChange(val) {
               this.pageSize = val;
               if(this.checkboxGroup1.length !== 0 || this.checkboxGroup2.length !== 0 || this.positionGroup.length !== 0 || this.classGroup.length !== 0 || this.dynastyGroup.length !== 0 ||this.regimeGroup.length !== 0 ) {
                  this.searchFromFilter(this.pageSize,this.currentPage);
               }else {
                 this.getTableData(this.input, this.pageSize, this.currentPage);
               }

               if(this.input == '') {
                   this.isShowSearchResult = false;
                   this.showSearchKeyword = '';
                }else {
                   this.isShowSearchResult = true;
                   this.showSearchKeyword = this.input; 
                }

            },
            handleCurrentChange(val) {
                this.currentPage = val;
                if(this.checkboxGroup1.length !== 0 || this.checkboxGroup2.length !== 0 || this.positionGroup.length !== 0 || this.classGroup.length !== 0 || this.dynastyGroup.length !== 0 ||this.regimeGroup.length !== 0 ) {
                  this.searchFromFilter(this.pageSize,this.currentPage);
               }else {
                  this.getTableData(this.input, this.pageSize, this.currentPage);
                } 

                if(this.input == '') {
                   this.isShowSearchResult = false;
                   this.showSearchKeyword = '';
                }else {
                   this.isShowSearchResult = true;
                   this.showSearchKeyword = this.input; 
                }
            },

            handleSelect(key, keyPath) {
                console.log(key, keyPath);
            },
            //模拟下载事件
            download(e,sectionid,item,index) {
                CloseMenueStrip();
                item.currentPage = this.currentPage;

                //验证有没有用户信息
                var hasUserId = volidUserId(true);
                if(!hasUserId) return; 

                if(item.hasDown) {
                    e.stopPropagation();
                    this.toBookView(sectionid,item);
                    
                  }else {
                    //只要一点击就变为0
                    item.startDownLoad = true;
                    this.$set(this.bookListData,index,item);

                    if(env == 'dev') {
                       var setTime = setInterval(()=>{
                            if(item.downLoadPercent >= 100) {
                               item.downLoadPercent = 100;
                               item.hasDown = true;  
                               this.$set(this.bookListData,index,item)
                               clearInterval(setTime);
                            }else {
                               item.downLoadPercent++;
                               this.$set(this.bookListData,index,item)
                            }
                        }, 50)
                    }else if(env == 'prod') {
                    // 获取图书下载地址,这是同步的方式
                    // var resFromWinF = ApiTransfer('get','/file/stream','fileid='+item.DefaultFileId+'&isPC=true'+'&userid='+localStorage.getItem('userId'));
                    //     resFromWinF = JSON.parse(resFromWinF);

                    //     if(resFromWinF.Code == 200) {
                    //         item.downloadUrl = resFromWinF.Data;

                    //         var downdata = {
                    //               downloadUrl:item.downloadUrl,
                    //               resourceid:item.Id+'',
                    //               type:item.Type,
                    //               title:item.Title,
                    //               source:item.Source,
                    //               userid:localStorage.getItem('userId')
                    //            }

                    //         item.nativeUrl = DownLoad(JSON.stringify(downdata));
                    //         //开始下载
                    //         //获取图书密钥
                    //        var resFromWinfGetSecret = ApiTransfer('get','/resource/detail','resourceid='+sectionid+'&userid='+localStorage.getItem('userId'));
                    //            resFromWinfGetSecret = JSON.parse(resFromWinfGetSecret);
                               
                    //            if(resFromWinfGetSecret.Code == 200) {
                    //               item.secret = resFromWinfGetSecret.Data.Secret;
                    //               var setTime = setInterval(() => {
                    //                   if (item.downLoadPercent >= 100) {
                    //                       item.downLoadPercent = 100;
                    //                       item.hasDown = true;

                    //                       clearInterval(setTime);
                    //                   } else {
                    //                       item.downLoadPercent = Math.floor(GetDownLoadProgress(item.downloadUrl));
                    //                   }
                    //                   this.$set(this.bookListData, index, item)
                    //               }, 500)

                    //            }else {
                    //               ShowMessage('出现未知错误，请关闭重试！');
                    //            } 
                    //     }else {
                    //         ShowMessage('出现未知错误，请关闭重试！');
                    //     }

                     var data = {
                         fileid:item.DefaultFileId,
                         isPC:true,
                         userid:localStorage.getItem('userId'),
                         type:2,
                         resourceid:item.Id,
                         source:item.Source,
                         title:item.Title,
                     }

                     //下面是配合winform异步获取数据
                     // ApiTransfer('get','/file/stream',JSON.stringify(data),(resFromWinF)=>{
                     //        resFromWinF = JSON.parse(resFromWinF);

                     //        if(resFromWinF.Code == 200) {
                     //            item.downloadUrl = resFromWinF.Data;

                     //            var downdata = {
                     //                  downloadUrl:item.downloadUrl,
                     //                  resourceid:item.Id+'',
                     //                  type:item.Type,
                     //                  title:item.Title,
                     //                  source:item.Source,
                     //                  userid:localStorage.getItem('userId')
                     //               }

                     //            // item.nativeUrl = DownLoad(JSON.stringify(downdata));

                     //             DownLoad(JSON.stringify(downdata),(nativeUrl)=>{
                     //                item.nativeUrl = nativeUrl;
                     //                GetDownLoadProgress(item.downloadUrl,(progress)=>{
                     //                    if (Math.floor(progress) >= 100) {
                     //                        item.downLoadPercent = 100;
                     //                        item.hasDown = true;
                     //                    } else {
                     //                        item.downLoadPercent = Math.floor(progress);
                     //                    }

                     //                    this.$set(this.bookListData, index, item)
                     //                })
                     //            })
                     //            //开始下载
                     //            //获取图书密钥
                     //           // var resFromWinfGetSecret = ApiTransfer('get','/resource/detail','resourceid='+sectionid+'&userid='+localStorage.getItem('userId'));
                     //           //     resFromWinfGetSecret = JSON.parse(resFromWinfGetSecret);
                                   
                     //           //     if(resFromWinfGetSecret.Code == 200) {
                     //           //        item.secret = resFromWinfGetSecret.Data.Secret;
                     //           //        
                     //           //        
                     //           //        
                     //                  // var setTime = setInterval(() => {
                     //                  //     if (item.downLoadPercent >= 100) {
                     //                  //         item.downLoadPercent = 100;
                     //                  //         item.hasDown = true;

                     //                  //         clearInterval(setTime);
                     //                  //     } else {
                     //                  //         item.downLoadPercent = Math.floor(GetDownLoadProgress(item.downloadUrl));
                     //                  //     }
                     //                  //     this.$set(this.bookListData, index, item)
                     //                  // }, 500)

                     //               // }else {
                     //               //    ShowMessage('出现未知错误，请关闭重试！');
                     //               // } 
                     //        }else {
                     //            ShowMessage(resFromWinF.Description);
                     //        }
                     //  });

                     //多线程异步下载
                      DownLoadProgress('get','/file/stream',JSON.stringify(data),(progress,nativeUrl,err)=>{
                              
                              if(err) {
                                    OpenForm(480,500,'/index.html#/userCenter','个人信息');
                                    localStorage.setItem('fromWhere',3);
                                    item.startDownLoad = true;
                                    this.$set(this.bookListData,index,item);
                              }else {
                                  item.nativeUrl = nativeUrl;
                                  //获取下载进度
                                  if (Math.floor(progress) >= 100) {
                                      item.downLoadPercent = 100;
                                      item.hasDown = true;
                                  } else {
                                      item.downLoadPercent = Math.floor(progress);
                                  }


                                  // document.getElementById('downloadBtn'+index).innerText = progress;
                                  if(this.currentPage == item.currentPage) this.$set(this.bookListData, index, item)
                              }
                          });
                      }
                  }  
              },
            handleChange() {

            },

            //打开筛选界面，并获取数据
            openFilterMenu() {

               this.dialogVisible = true;  
               if(this.hasGetFilterData) {
                  //每次打开的时候判断是否已经获取过数据了，如果是则直接展示数据
                  //每次打开的时候，保存上次所选的数据，防止取消等回滚操作
                  // checkboxGroup1  checkboxGroup2  positionGroup  classGroup  dynastyGroup duration
                  
                  this.preAllSelectData = {
                     checkboxGroup1:[...this.checkboxGroup1],
                     checkboxGroup2:[...this.checkboxGroup2],
                     positionGroup:[...this.positionGroup],
                     classGroup:[...this.classGroup],
                     dynastyGroup:[...this.dynastyGroup],
                     duration:this.duration,
                  }


                  if(this.allSearchOption[this.allSearchOption.length - 1].indexOf('公元') != -1) {
                     this.preAllSelectData.durationStr = this.allSearchOption[this.allSearchOption.length - 1];
                  }


                  return; 
               }
               this.hasGetFilterData = true;
               this.loading = true;
               //获取列表数据
               this.getFilterData(1);
               this.getFilterData(3);
               this.getFilterData(4);
               this.getFilterData(5);
               this.getFilterData(6);
               // setTimeout(()=>{
               //    // console.log(this.allResponseData)
               //    this.loading = false;
               // },4000)

               // 渲染每个栏的数据
               
            },

            getFilterData(type,ps=5000) {
                // 1-人物2-事件3-地区4-朝代5-方位6-分类属性
                if(env == 'dev') {
                  this.$http.get("/explicitword/list", {
                        params: {
                            type: type,
                            ps:ps
                        }
                    })
                    .then((res) => {
                      var aimArr = [];
                      res.data.Data.ItemList.forEach((item,index)=>{

                        type == 4 ? aimArr.push({title:item.Title,id:item.LocalId,selected:false}):aimArr.push({title:item.Title,id:item.Id});
                      })
                      this.dealData(type,aimArr);
                    })
                    .catch((err) => {
                      this.loading = false;
                        console.log(err)
                    })
                }else if(env == 'prod') {
                     // 下面这种是配合winform实现异步获取数据
                     if(type == 1 || type == 3) {
                       
                        var result = GetCacheData(type);
                        if(result == '') {
                           //如果第一次没有获取到数据，延迟几秒再次获取
                           this.delayGetData(type);
                           return;
                        }

                        result = JSON.parse(GetCacheData(type));

                        var aimArr = [];
                        result.Data.ItemList.forEach((item,index)=>{
                          aimArr.push({title:item.Title,id:item.Id});
                        })

                        this.dealData(type,aimArr);
                     }else {
                        ApiTransfer('get','/explicitword/list',JSON.stringify({
                                type: type,
                                ps:ps
                            }),(resFromWinF)=>{
                                // this.loading = false;
                                resFromWinF = JSON.parse(resFromWinF);

                                if(resFromWinF.Code == 200) {
                                    var aimArr = [];
                                    resFromWinF.Data.ItemList.forEach((item,index)=>{
                                      //如果是政权，且是中华民国时期或中华人民共和国时期
                                      if(type == 4 && (index == resFromWinF.Data.ItemList.length - 2 || index == resFromWinF.Data.ItemList.length - 1)) {
                                         aimArr.push({title:item.Title,id:item.Id,selected:false});

                                         //将这两个没有政权的id保存起来，筛选的时候好区分
                                         this.noRegimeids.push(item.Id);
                                      }else {
                                         type == 4 ? aimArr.push({title:item.Title,id:item.LocalId,selected:false}):aimArr.push({title:item.Title,id:item.Id});
                                      }

                                    })


                                    this.dealData(type,aimArr);
                                }else {
                                    ShowMessage(resFromWinF.Description);
                                }
                        }); 
                     }
                      

                    // var resFromWinF = ApiTransfer('get','/explicitword/list',conbineData({
                    //         type: type,
                    //         ps:ps
                    //     }));
                    // this.loading = false;
                    // resFromWinF = JSON.parse(resFromWinF);
                    // if(resFromWinF.Code == 200) {
                    //       var aimArr = [];
                    //       resFromWinF.Data.ItemList.forEach((item,index)=>{
                    //         type == 4 ? aimArr.push({title:item.Title,id:item.LocalId,selected:false}):aimArr.push({title:item.Title,id:item.Id});
                    //       })


                    //       this.dealData(type,aimArr);
                    // }else {
                    //     ShowMessage('出现未知错误，请关闭重试！');
                    // }
                }

            },
            //如果第一次没获取到数据，就2秒后再次获取
            delayGetData(type) {
               setTimeout(()=>{
                  this.getFilterData(type);
               }, 1000)
            },

            //处理数据
            dealData(type,aimArr) {
                 var _this = this;

                  switch (type) {
                    case 1:
                        // aimArr = this.pySegSort(aimArr);   //处理成首字母形式
                          PinYingSort(JSON.stringify(aimArr),(aimArr)=>{
                              _this.$set(_this.allResponseData,'persons',JSON.parse(aimArr));
                              _this.persons = _this.allResponseData.persons[0];
                          });

                          console.log(_this.persons)

                        break;
                    case 3:

                         PinYingSort(JSON.stringify(aimArr),(aimArr)=>{
                              _this.$set(_this.allResponseData,'addresses',JSON.parse(aimArr));
                              _this.addresses = _this.allResponseData.addresses[0];

                             _this.loading = false;
                         });
                         
                        break;
                    case 4:
                        _this.engFirstWord3 = aimArr;
                        _this.engFirstWord3[0].selected = true;
                        _this.getRegimeBydynasty(_this.engFirstWord3[0].id);
                        break;
                    case 5:
                        _this.position = aimArr;

                        break;
                    case 6:
                        _this.classes = aimArr;

                        break;                
                    default:
                        // statements_def
                        break;
                 } 
                 
                 
            },

            //改变字母或朝代选中状态
            handleSelectEngWorld(index, group,type) {
                if (group[index].selected) {
                    return
                }

                group.forEach((item, itemindex)=>{
                    item.selected = false;
                    if (itemindex == index) {
                        item.selected = true;
                        switch (type) {
                            case 1:
                                var activeWord = group[index].word.toUpperCase();
                                var wordIndex = this.getIndexByEngName(activeWord);
                                this.persons = [];
                                if(wordIndex !== -1) {
                                    // if(this.allResponseData.persons[wordIndex].length !== 0) {
                                        this.persons = this.allResponseData.persons[wordIndex];
                                   // }
                                }

                                console.log(this.persons)   

                                break;
                            case 3:
                                var activeWord = group[index].word.toUpperCase();
                                var wordIndex = this.getIndexByEngName(activeWord);
                                this.addresses = [];
                                if(wordIndex !== -1) {
                                    // if(this.allResponseData.addresses[wordIndex].length !== 0) {
                                        this.addresses = this.allResponseData.addresses[wordIndex];
                                    // }
                                }

                                console.log(this.addresses)
                                break;

                            case 4:
                                this.$set(this.engFirstWord3,index,item);
                                this.getRegimeBydynasty(item.id,index);
                                break;        
                            default:
                                // statements_def
                                break;
                        }
                        //处理政权数组选中bug
                    }
                })

            },
            //返回英文字母的在字母中的顺序
            getIndexByEngName(word) {
               var wordStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
               return wordStr.indexOf(word);
            },
            
            //获取朝代下的政权
            getRegimeBydynasty(dynastyid,_index) {
                 this.$http.get("/explicitword/GetRegimeList", {
                    params: {
                        localids: dynastyid,
                    }
                })
                .then((res) => {
                   this.dynasties = [];  
                  if(res.data.Data.length !== 0 ) {
                     res.data.Data.forEach((item,index)=>{
                        if(item.Title == '') {
                           //处理中华民国和中华人民共和国
                           this.dynasties.push({title:this.engFirstWord3[_index].title,id:this.engFirstWord3[_index].id})

                        }else {
                           this.dynasties.push({title:item.Title,id:item.Id})
                        }
                     })

                    //如果切换到某一个朝代时，这个朝代中的一些政权是已经选择过的，就渲染上选中样式
                     this.dynasties.forEach((item,index)=>{
                        if(this.allSearchOption[4].indexOf(item.title) !== -1) {
                            this.dynastyGroup.forEach((item1,index1)=>{
                                if(item1.title == item.title) {
                                  this.dynastyGroup.splice(index1,1,item);
                                }
                            })
                        }
                     })
                  }
                })
                .catch((err) => {
                    console.log(err)
                })
            },
            //取消或关闭筛选菜单执行的回调，判断是否有数据变更，进行回滚
            closeDialog() {

                this.dialogVisible = false;
                this.checkboxGroup1 = [...this.preAllSelectData.checkboxGroup1]; 
                this.checkboxGroup2 = [...this.preAllSelectData.checkboxGroup2]; 
                this.positionGroup = [...this.preAllSelectData.positionGroup]; 
                this.classGroup = [...this.preAllSelectData.classGroup]; 
                this.dynastyGroup = [...this.preAllSelectData.dynastyGroup]; 
                this.duration = this.preAllSelectData.duration; 
               

                if(this.preAllSelectData.durationStr) {
                   if(!this.allSearchOption[this.allSearchOption.length - 1] && this.allSearchOption[this.allSearchOption.length - 2].indexOf('公元') !== -1) {
                       this.allSearchOption.pop(this.allSearchOption.length - 1,1);

                       if(this.allSearchOption[this.allSearchOption.length - 1].indexOf('公元') !== -1) {
                          this.allSearchOption[this.allSearchOption.length - 1] = this.preAllSelectData.durationStr;
                       }else {
                          this.allSearchOption.push(this.preAllSelectData.durationStr);
                       }
                   }else {
                      if(this.preAllSelectData.durationStr.indexOf('公元') !== -1) {
                        this.allSearchOption[this.allSearchOption.length - 1] = this.preAllSelectData.durationStr;
                      }
                      
                   }
                }else { 
                   this.allSearchOption[this.allSearchOption.length - 1] = '时间段：';
                   this.input1 = '';
                   this.input2 = '';
                }
            },
            //开始使用筛选搜索
            searchFromFilter(ps=15,cp=1) {
                this.dialogVisible = false;
                var data = {};
                var relatedpersonids = '',  //人物
                     locations = '',        //方位
                     categorytypes = '',    //分类
                     duration = '',         //时间
                     relatedregionids = '', //地区 
                     relateddynastyids= '', //朝代，用于存放中华民国和中华人民共和国id
                     relatedregimeids = ''; //政权    
                //组合人物ids     
                this.checkboxGroup1.forEach((item,index)=>{
                    relatedpersonids += item.Id + ',';
                })
                relatedpersonids = relatedpersonids.slice(0,-1);            
                //组合地区ids
                this.checkboxGroup2.forEach((item,index)=>{
                    relatedregionids += item.Id + ',';
                })
                relatedregionids = relatedregionids.slice(0,-1);

                //政权ids
                this.dynastyGroup.forEach((item,index)=>{
                    relatedregimeids += item.id + ',';
                })
                relatedregimeids = relatedregimeids.slice(0,-1);      //这里是政权

                //从政权中剔除中华民国和中华人民共和国
                var regimeidsArr = relatedregimeids.split(',');

                this.noRegimeids.forEach((item,index)=>{
                   if(regimeidsArr.indexOf(item+'') !== -1) {
                      relateddynastyids += item +',';
                      regimeidsArr.splice(regimeidsArr.indexOf(item+''),1);
                   };
                });
 
                relateddynastyids = relateddynastyids.slice(0,-1);
                relatedregimeids = regimeidsArr.join(',');

                this.regimeGroup = relateddynastyids.split(',');

                //方位集合
                this.positionGroup.forEach((item,index)=>{
                    locations += item.title + ',';
                })
                locations = locations.slice(0,-1);

                //分类集合
                this.classGroup.forEach((item,index)=>{
                    categorytypes += item.title + ',';
                })
                categorytypes = categorytypes.slice(0,-1);
           
                //时间区间

                data = {
                    relatedpersonids:relatedpersonids,
                    relatedregionids:relatedregionids,
                    locations:locations,
                    duration:this.duration,
                    categorytypes:categorytypes,
                    type:2,
                    keyword:this.input,
                    cp:cp,
                    ps:ps,
                    relatedregimeids:relatedregimeids,     
                    relateddynastyids:relateddynastyids     
                }


                console.log(data);

                //整合数据完毕，开始查询
                //
                this.loading = true;
                
                this.doFilter(data);
                
            },
            
            //执行筛选
            doFilter(data) {
               // var conbData = Object.assign({},data,{type:2,ps:this.pageSize});
               if(env == 'dev') {
                
                   this.$http.get("/resource/list", {
                       params:data
                    })
                    .then((res) => {

                        this.loading = false;
                        this.bookListData = res.data.Data.ItemList;
                        this.totalData = res.data.Data.RecordCount;
                        this.bookListData.forEach((item,index)=>{
                           item['hasDown'] = false;
                           item['downLoadPercent'] = 0;
                           item['isExpand'] = false;
                          })
                        this.expands = [];
                    })
                    .catch((err) => {
                        this.loading = false;
                        console.log(err)
                    })
               }else if(env == 'prod') {
                    //下面这种是配合winform实现异步获取数据
                    ApiTransfer('get','/resource/list',JSON.stringify(data),(resFromWinF)=>{
                        this.loading = false;
                        resFromWinF = JSON.parse(resFromWinF);
                        if(resFromWinF.Code == 200) {
                            this.bookListData = resFromWinF.Data.ItemList;
                            this.totalData = resFromWinF.Data.RecordCount;
                            var listIds = [];
                            this.bookListData.forEach((item,index)=>{
                               item['hasDown'] = false;
                               item['downLoadPercent'] = 0;
                               item['isExpand'] = false;
                               item['startDownLoad'] = false;
                               listIds.push(item.Id)
                              })
                            this.expands = [];

                            //向后台发送缓存验证,获取已经下载过的文件
                              
                              //获取已下载的数据
                              if(localStorage.getItem('userId') && localStorage.getItem('userId') !== '') {

 
                                  //异步获取下载
                                  GetDownLoadedResources(listIds.join(','),localStorage.getItem('userId'),(hasDownLoadedContent)=>{
                                      hasDownLoadedContent = JSON.parse(hasDownLoadedContent);

                                      $('.el-table').find('th').eq(3).find('.cell').css('margin-right','0');

                                      if(hasDownLoadedContent.length == 0) return; 

                                      hasDownLoadedContent.forEach((getItem,getIndex)=>{
                                         this.bookListData.forEach((bookItem,bookIndex)=>{
                                             if(getItem.ResourceId == bookItem.Id) {
                                                 bookItem['hasDown'] = true;
                                                 bookItem['nativeUrl'] = getItem.FilePath;
                                                 bookItem['downLoadPercent'] = 100;

                                                 this.$set(this.bookListData,bookIndex,bookItem)
                                             }
                                         })
                                      })
                                  })
                              }

                            
                        }else {
                            ShowMessage(resFromWinF.Description);
                        }
                  });


                    // setTimeout(()=>{
                    //     var resFromWinF = ApiTransfer('get','/resource/list',conbineData(data));
                    //     this.loading = false;
                    //     resFromWinF = JSON.parse(resFromWinF);
                    //     if(resFromWinF.Code == 200) {
                    //         this.bookListData = resFromWinF.Data.ItemList;
                    //         this.totalData = resFromWinF.Data.RecordCount;
                    //         var listIds = [];
                    //         this.bookListData.forEach((item,index)=>{
                    //            item['hasDown'] = false;
                    //            item['downLoadPercent'] = 0;
                    //            item['isExpand'] = false;
                    //            listIds.push(item.Id)
                    //           })
                    //         this.expands = [];

                    //         //向后台发送缓存验证,获取已经下载过的文件
                              
                    //           //获取已下载的数据
                    //           if(localStorage.getItem('userId') && localStorage.getItem('userId') !== '') {
                    //               var hasDownLoadedContent = GetDownLoadedResources(listIds.join(','));
                    //                   hasDownLoadedContent = JSON.parse(hasDownLoadedContent);
                    //               if(hasDownLoadedContent.length == 0) return; 

                    //               hasDownLoadedContent.forEach((getItem,getIndex)=>{
                    //                  this.bookListData.forEach((bookItem,bookIndex)=>{
                    //                      if(getItem.ResourceId == bookItem.Id) {
                    //                          bookItem['hasDown'] = true;
                    //                          bookItem['nativeUrl'] = getItem.FilePath;
                    //                          bookItem['downLoadPercent'] = 100;
                    //                      }
                    //                  })
                    //               })
                    //           }

                    //         SaveArgument('');
                    //     }else {
                    //         ShowMessage('出现未知错误，请关闭重试！');
                    //     }
                    // },500)
                    
               }
            },
 

            //设置页码宽高和设置删选模态框内部宽高
            setHeight() {
                this.winHeight = window.innerHeight;
                this.winWidth = window.innerWidth;

                var winformWidth = GetFormWidth();
                if(this.winWidth <= parseInt(winformWidth) - 50) {
                   this.dialog = false; 
                }else {
                   this.dialog = true;
                }

                var personLeft = document.getElementById('person-left');
                var addressLeft = document.getElementById('address-left');
                var posLeft = document.getElementById('pos-left');
                var classLeft = document.getElementById('class-left');
                var dynastyLeft = document.getElementById('dynasty-left');
                if (!personLeft) {
                    return
                }
                var personRight = personLeft.nextSibling.nextSibling;
                var addressRight = addressLeft.nextSibling.nextSibling;
                var posRight = posLeft.nextSibling.nextSibling;
                var classRight = classLeft.nextSibling.nextSibling;
                var dynastyRight = dynastyLeft.nextSibling.nextSibling;

                if(this.winWidth >= 800) {
                    personLeft.style.height = personRight.offsetHeight + 'px';
                    addressLeft.style.height = addressRight.offsetHeight + 'px';
                    posLeft.style.height = posRight.offsetHeight + 'px';
                    classLeft.style.height = classRight.offsetHeight + 'px';
                    dynastyLeft.style.height = dynastyRight.offsetHeight + 'px';
                }else {
                    personLeft.style.height = '30px';
                    addressLeft.style.height = '30px';
                    posLeft.style.height = '30px';
                    classLeft.style.height = '30px';
                    dynastyLeft.style.height = '30px';
                }

                
            },
            handleIconClick(ev) {
                if(this.checkboxGroup1.length !== 0 || this.checkboxGroup2.length !== 0 || this.positionGroup.length !== 0 || this.classGroup.length !== 0 || this.dynastyGroup.length !== 0 ||this.regimeGroup.length !== 0 ) {
                  this.searchFromFilter(this.pageSize,this.currentPage);
                }else {
                  this.getTableData(this.input, this.pageSize, this.currentPage);
                }

                if(this.input == '') {
                   this.isShowSearchResult = false;
                   this.showSearchKeyword = '';
                }else {
                   this.isShowSearchResult = true;
                   this.showSearchKeyword = this.input; 
                } 
            },

            //重置搜索框
            resetSearchKey() {
                this.input = '';
                this.isShowSearchResult = false;
                this.showSearchKeyword = '';
                

                if(this.checkboxGroup1.length !== 0 || this.checkboxGroup2.length !== 0 || this.positionGroup.length !== 0 || this.classGroup.length !== 0 || this.dynastyGroup.length !== 0 ||this.regimeGroup.length !== 0 ) {
                  this.searchFromFilter(this.pageSize,this.currentPage);
                }else {
                  this.getTableData(this.input, this.pageSize, this.currentPage);
                }
            },

            toBooklist() {
                this.$router.push('/booklist');
            },
            handleCloseInList(tag, group) {
                this.handleClose(tag, group);
                this.searchFromFilter(this.pageSize,1);
                

                if(this.input == '') {
                   this.isShowSearchResult = false;
                   this.showSearchKeyword = '';
                }else {
                   this.isShowSearchResult = true;
                   this.showSearchKeyword = this.input; 
                }
            },
            handleClose(tag, group) {
                group.splice(group.indexOf(tag), 1);
            },
            handleCloseTimeStampInList() {
                this.handleCloseTimeStamp();
                this.searchFromFilter(this.pageSize,1);

                if(this.input == '') {
                   this.isShowSearchResult = false;
                   this.showSearchKeyword = '';
                }else {
                   this.isShowSearchResult = true;
                   this.showSearchKeyword = this.input; 
                }
            },
            handleCloseTimeStamp() {
                this.allSearchOption.pop();
                this.input1 = '';
                this.input2 = '';
                this.duration = '';

                if(this.isRegion) {
                  this.isRegion = false;
                  SetTabTitle('章节列表',GetFormId());
                }
            },
            allHandleClose(tag, group) {
                //删除总选择项，清除对应的分选择项的内容，保持同步
                var spliced = group.splice(group.indexOf(tag), 1);

                if (spliced[0].indexOf('人物') !== -1) {
                    this.checkboxGroup1 = [];
                } else if (spliced[0].indexOf('地点') !== -1) {
                    this.checkboxGroup2 = [];
                } else if (spliced[0].indexOf('方位') !== -1) {
                    this.positionGroup = [];
                } else if (spliced[0].indexOf('分类属性') !== -1) {
                    this.classGroup = [];
                } else if (spliced[0].indexOf('政权') !== -1) {
                    this.dynastyGroup = [];
                } else if (spliced[0].indexOf('时间段') !== -1) {
                    this.input1 = '';
                    this.input2 = '';
                    group.push('')
                }

            },
            resetAllSelect(index, title, group) {
                //重置所有选择的数组的对应项
                var selectedStr = '';
                group.forEach((item,index)=>{
                    if(item.Title) selectedStr += item.Title +'、';
                    else selectedStr += item.title +'、';  
                })

                selectedStr = selectedStr.slice(0,-1);

                if (this.allSearchOption[index]) {
                    if (this.allSearchOption[index].indexOf(title) == -1) {
                        this.allSearchOption.splice(index, 0, title + '：' + selectedStr);
                    } else {
                        this.allSearchOption[index] = title + '：' + selectedStr;
                    }
                } else {
                    this.allSearchOption[index] = title + '：' + selectedStr;
                }
            },
            dateResolve() {
                // 处理公元选项
                if (this.input1 == '' && this.input2 == '') {
                    this.duration = '';
                    this.allSearchOption[this.allSearchOption.length - 1] = '';
                    return;
                }
                this.input1 = this.input1 == '' ? 0 : this.input1;
                this.input2 = this.input2 == '' ? 0 : this.input2;

                this.input1 = parseInt(this.input1)
                this.input2 = parseInt(this.input2)

                if (this.select1 == '公元前') {
                    if (this.select2 == '公元前') {
                        this.allSearchOption[this.allSearchOption.length - 1] = this.input1 > this.input2 ? this.select1 + ' ' + this.input1 + ' 年 ~ ' + this.select2 + ' ' + this.input2 + ' 年' : this.select1 + ' ' + this.input2 + ' 年 ~ ' + this.select2 + ' ' + this.input1 + ' 年';


                        this.duration = this.input1 > this.input2 ? this.input1+',1|' + this.input2 + ',1' :  this.input2+',1|' + this.input1 + ',1';


                    } else {
                        this.allSearchOption[this.allSearchOption.length - 1] = this.select1 + ' ' + this.input1 + ' 年 ~ ' + this.select2 + ' ' + this.input2 + ' 年';
                        this.duration = this.input1+',1|' + this.input2 + ',0';
                    }
                } else {
                    if (this.select2 == '公元前') {
                        this.allSearchOption[this.allSearchOption.length - 1] = this.select2 + ' ' + this.input2 + ' 年 ~ ' + this.select1 + ' ' + this.input1 + ' 年'

                         this.duration = this.input2+',1|' + this.input1 + ',0';
                    } else {
                        this.allSearchOption[this.allSearchOption.length - 1] = this.input1 > this.input2 ? this.select1 + ' ' + this.input2 + ' 年 ~ ' + this.select2 + ' ' + this.input1 + ' 年' : this.select1 + ' ' + this.input1 + ' 年 ~ ' + this.select2 + ' ' + this.input2 + ' 年';

                        this.duration = this.input1 > this.input2 ? this.input2+',0|' + this.input1 + ',0' :  this.input1+',0|' + this.input2 + ',0';
                    }
                }
            }
        },
        mounted() {
            // ShowDevTools();
            this.getTableData(this.input, this.pageSize, this.currentPage);
            //用于设置navmenu的高度，解决element-ui不能设置高度的bug
            this.setHeight();
            
            
            var container =  this.$refs.sectionList;
            
 
        },
        updated() {
            var container =  this.$refs.sectionList;

             //解决章节列表第三列状态两个字不居中的bug
            if(container.getElementsByClassName('el-table_1_column_4')[0]) {
               container.getElementsByClassName('el-table_1_column_4')[0].children[0].style.marginRight = 0; 
            }
            

            //用于设置模态框中多选框的样式
            var listofCheckBox = container.getElementsByClassName('el-checkbox-button__inner');

            for (let i = 0; i < listofCheckBox.length; i++) {
                listofCheckBox[i].style.borderRadius = '10px';
                listofCheckBox[i].style.padding = '5px 15px';
                listofCheckBox[i].style.border = '1px solid #2b579a';
            }

          
            var listOfIcon = container.getElementsByClassName('el-table__expand-icon');
            for(var i = 0 ; i < listOfIcon.length ; i ++) {
                listOfIcon[i].style.display  = 'none'
            }

            var listOfColGroup = container.getElementsByTagName('colgroup');
            for(var i = 0 ; i < listOfColGroup.length ; i ++) {
                listOfColGroup[i].children[0].setAttribute('width', '0');
            }

            var listOfExp = document.getElementsByClassName('el-table__expanded-cell');
            for(var i = 0 ; i < listOfExp.length ; i++) {
               listOfExp[i].style.background = '#afd0fe';
            }

            this.setHeight();
            //设置窗口名称
            if(!this.isRegion) {
               SetTabTitle('章节列表',GetFormId());
            }
            window.onresize = () => {
               this.setHeight();
            }

        },


        watch: {
            'winWidth': function() {
                this.setHeight();
            },
            'radio99':function() {
                this.$router.push('/booklist');
            },
            'checkboxGroup1': function() {
                this.resetAllSelect(0, '人物', this.checkboxGroup1)
            },
            'checkboxGroup2': function() {
                this.resetAllSelect(1, '地点', this.checkboxGroup2);
            },
            'positionGroup': function() {
                this.resetAllSelect(2, '方位', this.positionGroup);
            },
            'classGroup': function() {
                this.resetAllSelect(3, '分类属性', this.classGroup);
            },
            'dynastyGroup': function() {
                this.resetAllSelect(4, '政权', this.dynastyGroup)
            },
            // 'input':function(nw,ov) {                
            //     if(nw == '') {
            //       this.doFilter({
            //          keyword:'',
            //          ps: this.pageSize, //每页条数
            //          cp: 1, //当前页
            //          type: 2
            //       })
            //     } 
            // },
            'input1': function() {
                if (this.input1 == '') {
                    return;
                }
                if (this.input1 < 0) {
                    this.input1 = 0;
                }
            },
            'input2': function() {
                if (this.input2 == '') {
                    return;
                }
                if (this.input2 < 0) {
                    this.input2 = 0;
                }
            }

        }
}
</script>
<style lang="css" scoped>

.seled{outline:1px solid #337ab7;}
/*.seled .el-collapse-item__header {
    background-color:#D6DFF7 !important;
}*/
.booklist {
    width: 100%;
    overflow-y: scroll;
    /*background: red*/
}

.book-section {
    height: 850px;
    box-sizing: border-box;
    /*border:1px solid black;*/
}

.book-content {
    width: 100%;
    height: 100%;
}

.book-cont-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    flex-wrap: nowrap;
    overflow:hidden;
}

.book-cont-head span {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.book-cont-head button {
    margin: 0 10px
}

.book-content ul {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.booklist-item {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
    border: 1px solid #ddd;
    height: 100px;
    width: 98%;
    /*background: #eee;*/
}

.booklist-item:hover {
    box-shadow: 1px 1px 10px #888;
}

.booklist-item:hover .booklist-item-cont li:nth-child(2) button {
    display: block;
}

.booklist-item-cont li {
    height: 25px;
    width: 98%;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    cursor: pointer;
    color: #444;
}

.booklist-item-cont li:nth-child(2) {
    display: flex;
    justify-content: space-between;
    height: 32px;
    margin: 3px 0 8px 0;
}

.booklist-item-cont li:nth-child(2) p {
    width: 80%;
    height: 100%;
}

.booklist-item-cont li:nth-child(2) button {
    margin-right: 20px;
    display: none
}

.hr {
    height:1px;
    width:100%;
    background:#ccc;
    margin: 10px 0;
}


.person-search {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: auto;
    min-height: 100px;
}

.other-group {
    min-height: 0
}

.person-left {
    display: flex;
    justify-content: center;
    /*align-items: center;*/
    width: 15%;
    height: 100%;
    /*background: #5980b8;*/
    color:#666;
}

.person-left span{
    padding-top: 12px;
}

.person-right {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    width: 85%;
    height: 100%;
    /*background: #eee;*/
}

.eng-first-word {
    height: auto;
    width: 100%;
}

.eng-first-word ul {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 5px
}

.eng-first-word li {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    cursor: pointer;
    /*outline: 1px solid  #5980b8;*/
    padding: 2px 6px;
    margin: 5px 3px 5px 0px;
/*    width: 20px;
    height: 20px;*/
}

.eng-first-word li:hover {
    outline: 1px solid  #5980b8;
}

.has-selected p {
    min-height: 30px;
    margin: 10px 0 0 0;
}

.dynasty-word li {
    width: auto;
    /*outline: 1px solid  #5980b8;*/
    padding: 2px 5px;
    margin: 5px 5px;
}

.dynasty-date {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    margin: 5px 0;
    min-height: 30px;
    height: auto;
}

.dynasty-date select {
    padding: 2px 0;
}

.dynasty-date input {
    padding: 0 5px;
    margin: 0 5px;
    height: 21px;
    width: 80px;
    border: 1px solid #aaa;
}

.all-selected {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 15px;
}

.all-selected>span {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.el-tag {
    height: auto;
    min-height: 24px;
    white-space: wrap !important;
    vertical-align: top
}

.el-checkbox-button--small {
    font-weight: 400 !important;
}



td a {
    color:#444;
}

td a:hover {
    color: #2b579a;
}

th {
    background: #afd0fe;
}

tbody tr {
    background: #fff;
}

tbody tr:nth-child(2n) {
    background: #fafafa;
}

tbody tr:hover {
    background: #afd0fe;
}

.line-2 {
    width: 20%;
    position: relative;
}

@media screen and (max-width: 800px) {
    .person-search {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
    .person-left {
        width: 100%;
        height: 100%;
    }
    .person-right {
        width: 100%;
        height: 100%;
        background: #eee;
    }
}

/* @media screen and (max-width: 768px) {
    .el-radio-group {
        margin-left: 10px;
    }
    .el-input {
        margin-right: 10px
    }
} */

.el-pagination {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    margin: 20px 0;
}
.noTableData {
    display:flex;
    justify-content: center;
    align-items: center;
    height:100px;
    width:100%;
}

  .el-table {
     font-size: 12px;
  }
  .demo-table-expand {
    font-size: 0;

  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;

  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }


  .expand-bg {
    background: rgb(223, 227, 236);
  }

  .current-row-my {
    background: #afd0fe; 
 }

 /* .el-table__expand-icon  {
    display: none
  }*/
</style>
